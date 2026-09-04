// Red-card detection (spec sections 3, 4 and 5).
//
// RedMatch alerts on exactly one thing: a player being sent off. Goals, yellow
// cards, substitutions, penalties, VAR checks and period boundaries must never
// produce an alert.
import type { Fixture, FixtureEvent, RedCardEvent } from "./types"

/**
 * API-Football encodes dismissals as `type: "Card"` with one of these details.
 *
 * A second booking that sends a player off is reported with DIFFERENT wording
 * depending on the league/feed — API-Football uses both "Second Yellow card" and
 * "Yellow-Red Card" for the exact same event (a straight red is "Red Card").
 * All three must trigger the alert: a two-yellows expulsion is a red card and
 * must be treated identically to a straight red (this is precisely what was
 * missed for Lopy D. in Al Qadsiah–Al-Ittihad, where the feed said
 * "Yellow-Red Card"). A plain "Yellow Card" is never a dismissal and is excluded.
 */
const DISMISSAL_DETAILS = new Set(["red card", "second yellow card", "yellow-red card", "yellow red card"])

function normaliseDetail(value: string): string {
  return value.trim().toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ")
}

/** True only for events that represent an actual expulsion. */
export function isRedCardEvent(event: FixtureEvent): boolean {
  if (event.type.trim().toLowerCase() !== "card") return false
  // Collapse inner whitespace + lowercase so "Yellow-Red Card", "Second Yellow
  // card" and odd spacing all normalise to a canonical form before comparison.
  const detail = normaliseDetail(event.detail)
  // Exact-set membership, not `includes("red")`: a detail like
  // "Yellow Card, red card rescinded" must not trigger an alert.
  return DISMISSAL_DETAILS.has(detail)
}

/** A single (first-or-second) booking: `type: "Card"`, `detail: "Yellow Card"`. */
function isYellowCardEvent(event: FixtureEvent): boolean {
  if (event.type.trim().toLowerCase() !== "card") return false
  return normaliseDetail(event.detail) === "yellow card"
}

/** Stable per-player identity used to count bookings within one fixture. */
function playerIdentity(event: FixtureEvent): string | null {
  // The feed can omit the player id on one of two bookings; names are more
  // reliable for linking the pair and avoid treating p123 and nname as two players.
  const name = event.player.trim().toLowerCase()
  if (name && name !== "joueur inconnu") return `n${normaliseName(name)}`
  if (event.playerId !== null) return `p${event.playerId}`
  return null
}

/**
 * Derives sending-offs that the feed reports as two separate "Yellow Card"
 * events instead of an explicit "Second Yellow card"/"Yellow-Red Card".
 *
 * This is the common API-Football shape and the reason two-yellow dismissals
 * were previously missed entirely (e.g. Keller T., Heidenheim–Dynamo Dresden):
 * the second booking arrives as a plain "Yellow Card", which `isRedCardEvent`
 * rightly excludes on its own. Two yellows in a match is always a red under the
 * Laws of the Game, so counting them is safe and produces no false positives.
 *
 * A player without a resolvable identity (no id, no usable name) is skipped —
 * two unattributable yellows can't be proven to belong to the same player.
 */
function deriveSecondYellowDismissals(events: FixtureEvent[]): FixtureEvent[] {
  const yellowsByPlayer = new Map<string, FixtureEvent[]>()
  for (const event of events) {
    if (!isYellowCardEvent(event)) continue
    const id = playerIdentity(event)
    if (!id) continue
    const list = yellowsByPlayer.get(id)
    if (list) list.push(event)
    else yellowsByPlayer.set(id, [event])
  }

  const dismissals: FixtureEvent[] = []
  for (const bookings of yellowsByPlayer.values()) {
    if (bookings.length < 2) continue
    // Present the dismissal at the LATER booking's minute, and relabel it so
    // downstream messaging reads as a second-yellow sending-off.
    const secondBooking = bookings.reduce((latest, current) =>
      eventMinute(current) >= eventMinute(latest) ? current : latest,
    )
    dismissals.push({ ...secondBooking, detail: "Second Yellow card" })
  }
  return dismissals
}

function eventMinute(event: FixtureEvent): number {
  return (Number.isFinite(event.minute) ? event.minute : 0) + (event.minuteExtra ?? 0)
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

  // Explicit dismissals first so they win the dedup over a derived second
  // yellow for the same player; then the two-yellow sending-offs the feed only
  // exposes as separate "Yellow Card" events.
  const candidates = [...events.filter(isRedCardEvent), ...deriveSecondYellowDismissals(events)]

  const seen = new Set<string>()
  const results: RedCardEvent[] = []
  for (const event of candidates) {
    const eventKey = buildEventKey(fixture, event)
    if (seen.has(eventKey)) continue
    seen.add(eventKey)
    results.push({
      eventKey,
      fixtureId: fixture.id,
      leagueId: fixture.leagueId,
      leagueName: fixture.leagueName,
      country: fixture.country,
      leagueLogo: fixture.leagueLogo,
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
    })
  }
  return results
}

/** The events table constrains minute to 0-130; keep parsing tolerant of odd feeds. */
function clampMinute(minute: number): number {
  if (!Number.isFinite(minute)) return 0
  return Math.max(0, Math.min(130, Math.round(minute)))
}
