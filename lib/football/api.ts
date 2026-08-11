// Typed API-Football queries: current season, live fixtures, fixture events.
import "server-only"

import { apiFootballRequest } from "./client"
import { competitionById, enabledLeagueIds, isWatchedLeague } from "./competitions"
import type { Fixture, FixtureEvent, RawEvent, RawFixture, RawLeague } from "./types"

/** Statuses in which a fixture is actually being played (spec section 6). */
const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"])

export function isLiveStatus(status: string): boolean {
  return LIVE_STATUSES.has(status.toUpperCase())
}

/**
 * Resolves the season API-Football currently considers active for a league.
 *
 * The spec forbids hardcoding a year or reusing an old season just because it
 * exists. `current=true` makes API-Football itself name the active season, which
 * also handles cups and cross-year calendars correctly. Cached for 12h: a
 * league's current season changes at most once a year.
 */
export async function fetchCurrentSeason(leagueId: number): Promise<number | null> {
  const leagues = await apiFootballRequest<RawLeague>("/leagues", {
    params: { id: leagueId, current: "true" },
    revalidate: 43_200,
  })
  const seasons = leagues[0]?.seasons ?? []
  const current = seasons.find((s) => s?.current === true) ?? seasons[seasons.length - 1]
  return typeof current?.year === "number" ? current.year : null
}

/** League name as API-Football reports it, used to validate configured ids. */
export async function fetchLeagueName(leagueId: number): Promise<string | null> {
  const leagues = await apiFootballRequest<RawLeague>("/leagues", {
    params: { id: leagueId },
    revalidate: 43_200,
  })
  const name = leagues[0]?.league?.name
  return typeof name === "string" ? name : null
}

/**
 * All live fixtures across the watched competitions.
 *
 * Uses a single `fixtures?live=` call listing every league id rather than one
 * call per competition: 21 separate requests per poll would burn the quota for
 * no benefit (spec section 6, "ne pas faire des centaines d'appels inutiles").
 * Cached for 30s so overlapping callers share one upstream request.
 */
export async function fetchLiveFixtures(leagueIds: number[] = enabledLeagueIds()): Promise<Fixture[]> {
  if (!leagueIds.length) return []

  const raw = await apiFootballRequest<RawFixture>("/fixtures", {
    params: { live: leagueIds.join("-") },
    revalidate: 30,
  })

  return raw
    .map(parseFixture)
    .filter((fixture): fixture is Fixture => fixture !== null)
    // The API is asked for specific leagues, but never trust the filter came
    // back applied — re-check before we act on a fixture.
    .filter((fixture) => isWatchedLeague(fixture.leagueId))
}

/** Events for one fixture. Not cached: this is the red-card detection path. */
export async function fetchFixtureEvents(fixtureId: number): Promise<FixtureEvent[]> {
  const raw = await apiFootballRequest<RawEvent>("/fixtures/events", {
    params: { fixture: fixtureId },
    revalidate: 0,
  })
  return raw.map(parseEvent).filter((event): event is FixtureEvent => event !== null)
}

/** A single fixture by id, used by the connection test on a known match. */
export async function fetchFixtureById(fixtureId: number): Promise<Fixture | null> {
  const raw = await apiFootballRequest<RawFixture>("/fixtures", {
    params: { id: fixtureId },
    revalidate: 60,
  })
  const fixture = raw[0]
  return fixture ? parseFixture(fixture) : null
}

// --- Validation -------------------------------------------------------------

/**
 * Converts a raw fixture into the internal shape, or null when required fields
 * are missing. Rejecting incomplete fixtures here means the detection code can
 * treat every field as present.
 */
export function parseFixture(raw: RawFixture): Fixture | null {
  const id = raw.fixture?.id
  const leagueId = raw.league?.id
  const home = raw.teams?.home?.name
  const away = raw.teams?.away?.name
  if (typeof id !== "number" || typeof leagueId !== "number") return null
  if (typeof home !== "string" || typeof away !== "string") return null

  const configured = competitionById(leagueId)
  const status = raw.fixture?.status?.short
  const elapsed = raw.fixture?.status?.elapsed

  return {
    id,
    leagueId,
    // Prefer our own configured names so alerts read consistently, but fall back
    // to whatever the API reports for leagues we don't have configured.
    leagueName: configured?.name ?? (typeof raw.league?.name === "string" ? raw.league.name : `League ${leagueId}`),
    country: configured?.country ?? (typeof raw.league?.country === "string" ? raw.league.country : "—"),
    season: typeof raw.league?.season === "number" ? raw.league.season : null,
    status: typeof status === "string" ? status.toUpperCase() : "NS",
    elapsed: typeof elapsed === "number" ? elapsed : null,
    homeTeam: home,
    awayTeam: away,
    homeScore: typeof raw.goals?.home === "number" ? raw.goals.home : 0,
    awayScore: typeof raw.goals?.away === "number" ? raw.goals.away : 0,
  }
}

/** Converts a raw event, or null when it lacks the fields detection needs. */
export function parseEvent(raw: RawEvent): FixtureEvent | null {
  const type = raw.type
  const detail = raw.detail
  if (typeof type !== "string" || typeof detail !== "string") return null

  const elapsed = raw.time?.elapsed
  const extra = raw.time?.extra
  const teamName = raw.team?.name
  const playerName = raw.player?.name

  return {
    minute: typeof elapsed === "number" ? elapsed : 0,
    minuteExtra: typeof extra === "number" ? extra : null,
    team: typeof teamName === "string" ? teamName : "—",
    teamId: typeof raw.team?.id === "number" ? raw.team.id : null,
    // API-Football occasionally omits the player on a card (unnamed staff, or
    // data entered late). Detection still fires: the expulsion is real even if
    // we can't name the player.
    player: typeof playerName === "string" && playerName.trim() ? playerName : "Joueur inconnu",
    playerId: typeof raw.player?.id === "number" ? raw.player.id : null,
    type,
    detail,
  }
}
