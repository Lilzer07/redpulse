// Per-user alert history.
//
// The dashboard reads `alerts` scoped to the signed-in user, so a detected
// expulsion has to be written here for each entitled subscriber. Writes go
// through the service-role client because the monitoring loop runs without a
// user session.
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { competitionById } from "./competitions"
import type { RedCardAnalysis, RedCardEvent } from "./types"

/**
 * Stable identity of one expulsion, used to make per-user delivery idempotent.
 * A replayed monitor pass produces the same key, so the unique index on
 * (user_id, event_key) rejects the duplicate instead of alerting twice.
 */
export function alertEventKey(event: RedCardEvent): string {
  return `${event.fixtureId}:${event.player}:${event.minute}`
}

/**
 * Records one alert row for one user.
 *
 * `delivered_at` is set only when Telegram actually accepted the message, so the
 * feed distinguishes "alert generated" from "alert delivered" instead of implying
 * a send that never happened.
 *
 * Returns `duplicate: true` when this user was already alerted for this exact
 * expulsion, so the caller can skip the send rather than spam the subscriber.
 */
export async function recordUserAlert(input: {
  userId: string
  event: RedCardEvent
  analysis: RedCardAnalysis
  deliveredAt: string | null
}): Promise<{ ok: boolean; error?: string; duplicate?: boolean }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "Service role key is not configured." }

  const { event, analysis } = input
  const competition = competitionById(event.leagueId)

  const { error } = await supabase.from("alerts").insert({
    user_id: input.userId,
    event_key: alertEventKey(event),
    // The dashboard filters by the catalogue slug, so store that rather than the
    // numeric API id.
    competition_id: competition?.slug ?? String(event.leagueId),
    competition: event.leagueName,
    home_team: event.homeTeam,
    away_team: event.awayTeam,
    score: `${event.homeScore}-${event.awayScore}`,
    minute: event.minute,
    player: event.player,
    carded_team: event.team,
    favorite: analysis.favorite,
    extra_goal_prob: analysis.extraGoalProb,
    favorite_win_prob: analysis.favoriteWinProb,
    impact: analysis.confidence,
    delivered_at: input.deliveredAt,
  })

  // 23505 = unique violation: this user already has an alert for this expulsion.
  if (error?.code === "23505") return { ok: true, duplicate: true }
  return error ? { ok: false, error: error.message } : { ok: true }
}


