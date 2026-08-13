// Monitoring loop (spec section 6).
//
// One run: find the live fixtures in the watched competitions, read their events,
// detect expulsions, claim each one exactly once, then publish the claimed ones to
// the private channel and record them in each subscriber's history.
import "server-only"

import { competitionById } from "./competitions"
import { fetchFixtureEvents, fetchLiveFixtures, isLiveStatus } from "./api"
import { analyseRedCard } from "./analysis"
import { extractRedCards } from "./red-cards"
import { acquireMonitorLock, claimRedCard, markDispatched, recordRunResult, releaseMonitorLock } from "./dedupe"
import { describeFailure, hasApiKey } from "./client"
import { recordUserAlert } from "./alerts"
import { reserveRequests } from "./budget"
import { generateCommentary } from "@/lib/ai/commentary"
import { logEvent } from "@/lib/logging"
import { formatTelegramAlert } from "@/lib/telegram/format"
import { sendChannelMessage } from "@/lib/telegram/service"
import { authorizeTelegramDelivery, findEligibleRecipients } from "@/lib/subscriptions/authorization"
import type { Fixture, RedCardWithAnalysis } from "./types"

/**
 * How often the loop may run, and how many fixtures' events are fetched at once.
 *
 * Centralised so the cadence can be retuned without touching logic (the spec
 * asks for an easily modifiable frequency). One poll costs
 * 1 + (number of live fixtures) requests, so the concurrency cap is what keeps a
 * busy Saturday from hitting the rate limit in a burst.
 */
export const MONITOR_CONFIG = {
  /**
   * Interval between polls, in seconds.
   *
   * 60s gives near-real-time detection and REQUIRES a paid API-Football plan:
   * the live-fixture list alone costs 1440 requests/day at this rate, versus the
   * free tier's 100. Set FOOTBALL_DAILY_REQUEST_BUDGET to the subscribed plan's
   * allowance (see ./budget), otherwise the quota is spent within roughly the
   * first 90 minutes of the day and monitoring stops until midnight UTC.
   *
   * The budget guard in ./budget, not this value, is what enforces the limit, so
   * an under-funded cadence degrades gracefully (fewer fixtures inspected, then a
   * `quota_exhausted` no-op) instead of erroring against the provider.
   */
  intervalSeconds: 60,
  /** Simultaneous /fixtures/events requests. */
  eventConcurrency: 4,
  /**
   * Lock lifetime; deliberately just under `intervalSeconds` so a crashed run
   * self-heals before the next pass rather than blocking it. It MUST stay below
   * the cadence: a TTL longer than the interval would make every scheduled pass
   * skip as "locked" — which is why dropping to a 60s cadence required lowering
   * this from 120s. If a slow pass ever outlives its lock, `claimRedCard` — not
   * this lock — is what still guarantees an alert is never published twice.
   */
  lockTtlSeconds: 55,
}

export type MonitorRunResult = {
  ok: boolean
  skipped?: "locked" | "no_api_key" | "quota_exhausted"
  /** Live fixtures left uninspected because the daily budget ran out. */
  skippedForBudget?: number
  matchesWatched: number
  redCardsFound: number
  newRedCards: RedCardWithAnalysis[]
  deliveries: { attempted: number; delivered: number }
  error?: string
}

/**
 * Executes one monitoring pass.
 *
 * Always releases the lock, including on failure — an aborted run must not block
 * the next poll for the remainder of the TTL.
 */
export async function runMonitorCycle(): Promise<MonitorRunResult> {
  const empty = { matchesWatched: 0, redCardsFound: 0, newRedCards: [], deliveries: { attempted: 0, delivered: 0 } }

  if (!hasApiKey()) {
    return { ok: false, skipped: "no_api_key", ...empty, error: "FOOTBALL_API_KEY is not configured." }
  }

  // Refuses to start while another run holds the lock, so two overlapping
  // invocations cannot both process the same fixtures.
  if (!(await acquireMonitorLock(MONITOR_CONFIG.lockTtlSeconds))) {
    return { ok: true, skipped: "locked", ...empty }
  }

  try {
    // The live-fixture list costs one request; if the day's budget is gone the
    // run stops here instead of issuing a call the provider would reject.
    if ((await reserveRequests(1)) < 1) {
      await recordRunResult({ matchesWatched: 0, newRedCards: 0, error: "Daily API request budget exhausted." })
      return {
        ok: true,
        skipped: "quota_exhausted",
        ...empty,
        error: "Daily API request budget exhausted; monitoring resumes at midnight UTC.",
      }
    }

    const fixtures = (await fetchLiveFixtures()).filter((fixture) => isLiveStatus(fixture.status))

    // One request per fixture inspected. Reserving up front means a Saturday with
    // more live matches than remaining budget degrades to inspecting a subset,
    // rather than firing calls that fail once the quota is hit mid-pass.
    const affordable = await reserveRequests(fixtures.length)
    const inspected = fixtures.slice(0, affordable)
    const skippedForBudget = fixtures.length - inspected.length

    const detected = await collectRedCards(inspected)

    const newRedCards: RedCardWithAnalysis[] = []
    let attempted = 0
    let delivered = 0

    for (const event of detected) {
      const analysis = analyseRedCard(event)

      // The claim is the deduplication gate: only a "claimed" result may alert.
      const claim = await claimRedCard(event, analysis)
      if (claim.status === "duplicate") continue
      if (claim.status === "unavailable") {
        await recordRunResult({
          matchesWatched: inspected.length,
          newRedCards: newRedCards.length,
          error: `Deduplication unavailable: ${claim.reason}`,
        })
        return {
          ok: false,
          skippedForBudget,
          matchesWatched: inspected.length,
          redCardsFound: detected.length,
          newRedCards,
          deliveries: { attempted, delivered },
          error: `Deduplication unavailable: ${claim.reason}`,
        }
      }

      const withAnalysis: RedCardWithAnalysis = { ...event, analysis }
      newRedCards.push(withAnalysis)

      // Composed once per expulsion, after the claim: the AI call only happens
      // for an alert that is genuinely going out, never for a duplicate. It
      // returns null on failure, in which case the alert ships with its figures
      // alone rather than waiting on the gateway.
      const commentary = await generateCommentary(event, analysis)

      const outcome = await dispatch(withAnalysis, commentary?.reading ?? null)
      attempted += outcome.attempted
      delivered += outcome.delivered

      await markDispatched(claim.id)
    }

    await recordRunResult({ matchesWatched: inspected.length, newRedCards: newRedCards.length })

    return {
      ok: true,
      skippedForBudget,
      // Reports fixtures actually inspected, not fixtures found: claiming to have
      // watched a match whose events were never fetched would be a false report.
      matchesWatched: inspected.length,
      redCardsFound: detected.length,
      newRedCards,
      deliveries: { attempted, delivered },
    }
  } catch (error) {
    const { message } = describeFailure(error)
    await recordRunResult({ matchesWatched: 0, newRedCards: 0, error: message })
    return { ok: false, ...empty, error: message }
  } finally {
    await releaseMonitorLock()
  }
}

/**
 * Reads events for every live fixture and returns the expulsions found.
 *
 * A single fixture failing (a 404, a malformed feed) must not abort the whole
 * cycle, so failures are swallowed per fixture and the rest still get processed.
 */
async function collectRedCards(fixtures: Fixture[]) {
  const found = []

  for (let i = 0; i < fixtures.length; i += MONITOR_CONFIG.eventConcurrency) {
    const batch = fixtures.slice(i, i + MONITOR_CONFIG.eventConcurrency)
    const results = await Promise.all(
      batch.map(async (fixture) => {
        try {
          const events = await fetchFixtureEvents(fixture.id)
          return extractRedCards(fixture, events)
        } catch {
          return []
        }
      }),
    )
    for (const cards of results) found.push(...cards)
  }

  return found
}

/**
 * Publishes one expulsion to the private channel, then records it in each
 * entitled subscriber's history.
 *
 * The channel replaces per-user direct messages: every subscriber reads the same
 * post, so the message is composed and sent exactly once. Access is enforced by
 * channel membership (granted on payment, revoked on lapse) rather than by
 * re-deciding per recipient at send time.
 *
 * Publishing before writing history is safe here because the caller only reaches
 * this function for a *claimed* expulsion — `claimRedCard` is the deduplication
 * gate, so a replayed pass never gets this far and cannot double-post.
 */
async function dispatch(
  event: RedCardWithAnalysis,
  aiReading: string | null,
): Promise<{ attempted: number; delivered: number }> {
  const competition = competitionById(event.leagueId)
  if (!competition) return { attempted: 0, delivered: 0 }

  const publication = await sendChannelMessage(formatTelegramAlert(event, event.analysis, aiReading))

  if (publication.ok) {
    logEvent("telegram_channel_published", { fixtureId: event.fixtureId, competition: competition.slug })
  } else {
    logEvent("telegram_alert_failed", {
      fixtureId: event.fixtureId,
      reason: publication.reason === "not_configured" ? "channel_not_configured" : publication.detail,
    })
  }

  // History is per user so the dashboard can show "your" alerts, but it is a
  // record of the publication, not a second delivery channel.
  const recipients = await findEligibleRecipients(competition.slug)
  if (!recipients.length) return { attempted: 0, delivered: 0 }

  const publishedAt = publication.ok ? new Date().toISOString() : null

  const results = await Promise.all(
    recipients.map(async (userId) => {
      // Only stamp delivery for users who could actually read the post: an
      // active subscription and live channel access. Stamping everyone would
      // claim a delivery for someone whose access had already been revoked.
      const authorization = await authorizeTelegramDelivery(userId)
      const deliveredAt = authorization.allowed ? publishedAt : null

      const claim = await recordUserAlert({ userId, event, analysis: event.analysis, deliveredAt })
      if (!claim.ok || claim.duplicate) return { attempted: false, delivered: false }
      return { attempted: authorization.allowed, delivered: Boolean(deliveredAt) }
    }),
  )

  let attempted = 0
  let delivered = 0
  for (const r of results) {
    if (r.attempted) attempted += 1
    if (r.delivered) delivered += 1
  }

  return { attempted, delivered }
}
