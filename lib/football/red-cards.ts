// Red-card detection (spec sections 3, 4 and 5).
//
// RedMatch alerts on exactly one thing: a player being sent off. Goals, yellow
// cards, substitutions, penalties, VAR checks and period boundaries must never
// produce an alert.
import type { Fixture, FixtureEvent, RedCardEvent } from "./types"

/**
 * API-Football encodes dismissals as `type: "Card"` with one of these details.
 *
 * "Second Yellow card" is included deliberately: in API-Football that detail is
 * only emitted when the second booking actually sends the player off, which is
 * the expulsion the spec asks us to react to. A plain "Yellow Card" is never a
 * dismissal and is excluded.
 */
const DISMISSAL_DETAILS = ["red card", "second yellow card"]

/** True only for events that represent an actual expulsion. */
export function isRedCardEvent(event: FixtureEvent): boolean {
  if (event.type.trim().toLowerCase() !== "card") return false
  const detail = event.detail.trim().toLowerCase()
  // Exact-set membership, not `includes("red")`: a detail like
  // "Yellow Card, red card rescinded" must not trigger an alert.
  return DISMISSAL_DETAILS.includes(detail)
}

/**
 * Stable identity for one expulsion, used as the unique deduplication key.
 *
 * API-Football does not expose an event id, so the key is composed from the
 * fixture plus the player. It deliberately EXCLUDES the minute: the API
 * regularly revises an event's minute a few polls after it first appears, and a
 * minute-sensitive key would treat the revision as a brand-new expulsion and
 * fire a second alert.
 *
 * The player id is preferred because names arrive with inconsistent accents and
 * abbreviations. When the API omits both id and name, the minute is folded back
 * in as the only remaining discriminator, so two unnamed dismissals in the same
 * match don't collapse into one.
 */
export function buildEventKey(fixture: Fixture, event: FixtureEvent): string {
  if (event.playerId !== null) {
    return `${fixture.id}:p${event.playerId}`
  }
  const name = event.player.trim().toLowerCase()
  if (name && name !== "joueur inconnu") {
    return `${fixture.id}:n${normaliseName(name)}`
  }
  return `${fixture.id}:t${event.teamId ?? event.team}:m${event.minute}`
}

function normaliseName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Extracts every expulsion from a fixture's event feed.
 *
 * Returns candidates only — whether an alert is actually sent is decided by the
 * deduplication ledger, not here.
 */
export function extractRedCards(fixture: Fixture, events: FixtureEvent[]): RedCardEvent[] {
  const detectedAt = new Date().toISOString()

  return events.filter(isRedCardEvent).map((event) => ({
    eventKey: buildEventKey(fixture, event),
    fixtureId: fixture.id,
    leagueId: fixture.leagueId,
    leagueName: fixture.leagueName,
    country: fixture.country,
    season: fixture.season,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    player: event.player,
    // The team of the player shown the card, i.e. the side going down to ten.
    team: event.team,
    minute: clampMinute(event.minute),
    minuteExtra: event.minuteExtra,
    detail: event.detail,
    fixtureStatus: fixture.status,
    detectedAt,
  }))
}

/** The events table constrains minute to 0-130; keep parsing tolerant of odd feeds. */
function clampMinute(minute: number): number {
  if (!Number.isFinite(minute)) return 0
  return Math.max(0, Math.min(130, Math.round(minute)))
}
