// Monitoring loop (spec section 6).
//
// One run: find the live fixtures in the watched competitions, read their events,
// detect expulsions, claim each one exactly once, then fan the claimed ones out to
// entitled subscribers.
import "server-only"

import { competitionById } from "./competitions"
import { fetchFixtureEvents, fetchLiveFixtures, isLiveStatus } from "./api"
import { analyseRedCard } from "./analysis"
import { extractRedCards } from "./red-cards"
import { acquireMonitorLock, claimRedCard, markDispatched, recordRunResult, releaseMonitorLock } from "./dedupe"
import { describeFailure, hasApiKey } from "./client"
import { deliverRedCardAlert } from "@/lib/telegram/send"
import { findEligibleRecipients } from "@/lib/subscriptions/authorization"
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
  /** Suggested interval between polls, in seconds. */
  intervalSeconds: 60,
  /** Simultaneous /fixtures/events requests. */
  eventConcurrency: 4,
  /** Lock lifetime; slightly under the interval so a crashed run self-heals. */
  lockTtlSeconds: 55,
}

export type MonitorRunResult = {
  ok: boolean
  skipped?: "locked" | "no_api_key"
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
    const fixtures = (await fetchLiveFixtures()).filter((fixture) => isLiveStatus(fixture.status))
    const detected = await collectRedCards(fixtures)

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
          matchesWatched: fixtures.length,
          newRedCards: newRedCards.length,
          error: `Deduplication unavailable: ${claim.reason}`,
        })
        return {
          ok: false,
          matchesWatched: fixtures.length,
          redCardsFound: detected.length,
          newRedCards,
          deliveries: { attempted, delivered },
          error: `Deduplication unavailable: ${claim.reason}`,
        }
      }

      const withAnalysis: RedCardWithAnalysis = { ...event, analysis }
      newRedCards.push(withAnalysis)

      const outcome = await dispatch(withAnalysis)
      attempted += outcome.attempted
      delivered += outcome.delivered

      await markDispatched(claim.id)
    }

    await recordRunResult({ matchesWatched: fixtures.length, newRedCards: newRedCards.length })

    return {
      ok: true,
      matchesWatched: fixtures.length,
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
 * Fans one expulsion out to the users subscribed to its competition.
 *
 * `deliverRedCardAlert` re-checks authorization per user, so this only has to
 * decide who to consider, not who is entitled.
 */
async function dispatch(event: RedCardWithAnalysis): Promise<{ attempted: number; delivered: number }> {
  const competition = competitionById(event.leagueId)
  if (!competition) return { attempted: 0, delivered: 0 }

  const recipients = await findEligibleRecipients(competition.slug)
  if (!recipients.length) return { attempted: 0, delivered: 0 }

  const outcomes = await Promise.all(recipients.map((userId) => deliverRedCardAlert(userId, event, event.analysis)))
  return { attempted: outcomes.length, delivered: outcomes.filter((o) => o.delivered).length }
}
