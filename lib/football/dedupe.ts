// Deduplication ledger and monitor state (spec sections 5 and 6).
//
// The guarantee that one expulsion produces one alert does NOT come from a
// "check, then write" sequence — two concurrent monitor runs would both pass the
// check and both alert. It comes from the unique index on
// red_card_events.event_key: both runs attempt the insert, the database rejects
// one with a unique violation, and only the surviving run dispatches.
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { RedCardAnalysis, RedCardEvent } from "./types"

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = "23505"

export type ClaimResult =
  | { status: "claimed"; id: string }
  | { status: "duplicate" }
  | { status: "unavailable"; reason: string }

/**
 * Attempts to claim an expulsion for alerting.
 *
 * "claimed" means this caller is the single owner of the event and must proceed
 * to dispatch. "duplicate" means someone already owns it — do nothing, do not
 * alert. Claiming and recording are the same atomic step on purpose: there is no
 * window in which an event is considered new twice.
 */
export async function claimRedCard(event: RedCardEvent, analysis: RedCardAnalysis): Promise<ClaimResult> {
  const supabase = createAdminClient()
  if (!supabase) {
    return { status: "unavailable", reason: "SUPABASE_SERVICE_ROLE_KEY is not configured." }
  }

  const { data, error } = await supabase
    .from("red_card_events")
    .insert({
      event_key: event.eventKey,
      fixture_id: event.fixtureId,
      league_id: event.leagueId,
      league_name: event.leagueName,
      country: event.country,
      season: event.season,
      home_team: event.homeTeam,
      away_team: event.awayTeam,
      home_score: event.homeScore,
      away_score: event.awayScore,
      player: event.player,
      team: event.team,
      minute: event.minute,
      minute_extra: event.minuteExtra,
      detail: event.detail,
      fixture_status: event.fixtureStatus,
      extra_goal_prob: analysis.extraGoalProb,
      favorite_win_prob: analysis.favoriteWinProb,
      confidence: analysis.confidence,
      analysis_favorite: analysis.favorite,
      detected_at: event.detectedAt,
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { status: "duplicate" }
    return { status: "unavailable", reason: error.message }
  }

  return { status: "claimed", id: data.id as string }
}

/** Marks an event as fully dispatched, so an interrupted run can be retried. */
export async function markDispatched(eventId: string): Promise<void> {
  const supabase = createAdminClient()
  if (!supabase) return
  await supabase.from("red_card_events").update({ dispatched_at: new Date().toISOString() }).eq("id", eventId)
}

// --- Monitor state ----------------------------------------------------------

export type MonitorState = {
  lastCheckedAt: string | null
  lastSuccessAt: string | null
  lastError: string | null
  matchesWatched: number
  redCardsDetected: number
  lastAlertAt: string | null
}

/** Reads the polling-loop health powering the dashboard block (spec section 14). */
export async function readMonitorState(): Promise<MonitorState | null> {
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("monitor_state")
    .select("last_checked_at,last_success_at,last_error,matches_watched,red_cards_detected,last_alert_at")
    .eq("id", true)
    .maybeSingle()

  if (error || !data) return null

  return {
    lastCheckedAt: data.last_checked_at as string | null,
    lastSuccessAt: data.last_success_at as string | null,
    lastError: data.last_error as string | null,
    matchesWatched: (data.matches_watched as number) ?? 0,
    redCardsDetected: (data.red_cards_detected as number) ?? 0,
    lastAlertAt: data.last_alert_at as string | null,
  }
}

/** Total expulsions ever recorded, read from the ledger itself. */
export async function countRedCardEvents(): Promise<number> {
  const supabase = createAdminClient()
  if (!supabase) return 0
  const { count } = await supabase.from("red_card_events").select("id", { count: "exact", head: true })
  return count ?? 0
}

/**
 * Takes the monitor lock (spec sections 5 and 6: protection against overlapping
 * runs).
 *
 * The conditional update is the mutual exclusion: `locked_until.lt.now` only
 * matches when no live lock exists, and Postgres serialises the competing
 * updates, so exactly one concurrent caller gets a row back.
 */
export async function acquireMonitorLock(ttlSeconds = 55): Promise<boolean> {
  const supabase = createAdminClient()
  if (!supabase) return false

  const now = new Date()
  const until = new Date(now.getTime() + ttlSeconds * 1000).toISOString()

  const { data, error } = await supabase
    .from("monitor_state")
    .update({ locked_until: until, last_checked_at: now.toISOString(), updated_at: now.toISOString() })
    .eq("id", true)
    .or(`locked_until.is.null,locked_until.lt.${now.toISOString()}`)
    .select("id")

  if (error) return false
  return Array.isArray(data) && data.length > 0
}

export async function releaseMonitorLock(): Promise<void> {
  const supabase = createAdminClient()
  if (!supabase) return
  await supabase
    .from("monitor_state")
    .update({ locked_until: null, updated_at: new Date().toISOString() })
    .eq("id", true)
}

/** Records the outcome of a monitor run. */
export async function recordRunResult(input: {
  matchesWatched: number
  newRedCards: number
  error?: string | null
}): Promise<void> {
  const supabase = createAdminClient()
  if (!supabase) return

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    matches_watched: input.matchesWatched,
    last_error: input.error ?? null,
    locked_until: null,
    updated_at: now,
  }
  if (!input.error) patch.last_success_at = now
  if (input.newRedCards > 0) patch.last_alert_at = now

  await supabase.from("monitor_state").update(patch).eq("id", true)

  if (input.newRedCards > 0) {
    // Keep the counter authoritative by deriving it from the ledger rather than
    // incrementing a cached number that could drift.
    const total = await countRedCardEvents()
    await supabase.from("monitor_state").update({ red_cards_detected: total }).eq("id", true)
  }
}
