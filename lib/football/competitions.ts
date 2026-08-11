// Centralised competition configuration (spec section 2).
//
// Competitions are identified by their official API-Football league id, never by
// name: names vary by locale and API-Football reuses them across countries
// ("Championship", "Serie B", "Copa del Rey" all have near-duplicates). The
// numeric id is the only stable key.
//
// `slug` ties each entry back to the existing UI competition list in lib/data.ts
// and to `user_competitions.competition_id`, so the dashboard, the per-user
// subscriptions and the monitor all speak about the same competition.

export type CompetitionType = "league" | "cup" | "european"

export type CompetitionConfig = {
  /** Official API-Football league id. */
  id: number
  /** Matches the `id` used in lib/data.ts and user_competitions.competition_id. */
  slug: string
  name: string
  country: string
  type: CompetitionType
  /** When false the monitor skips the competition entirely. */
  enabled: boolean
}

/**
 * The 21 competitions RedMatch watches.
 *
 * Ids are the documented API-Football v3 league ids. They are asserted at
 * runtime by the connection test (`verifyCompetitions`), which fetches each
 * league and reports any id whose returned name doesn't match — so a wrong id
 * surfaces as a failed check rather than silently monitoring nothing.
 */
export const COMPETITIONS: CompetitionConfig[] = [
  // England
  { id: 39, slug: "premier-league", name: "Premier League", country: "Angleterre", type: "league", enabled: true },
  { id: 40, slug: "championship", name: "Championship", country: "Angleterre", type: "league", enabled: true },
  { id: 45, slug: "fa-cup", name: "FA Cup", country: "Angleterre", type: "cup", enabled: true },
  // France
  { id: 61, slug: "ligue-1", name: "Ligue 1", country: "France", type: "league", enabled: true },
  { id: 62, slug: "ligue-2", name: "Ligue 2", country: "France", type: "league", enabled: true },
  { id: 66, slug: "coupe-de-france", name: "Coupe de France", country: "France", type: "cup", enabled: true },
  // Spain
  { id: 140, slug: "laliga", name: "LaLiga", country: "Espagne", type: "league", enabled: true },
  { id: 141, slug: "laliga-2", name: "LaLiga 2", country: "Espagne", type: "league", enabled: true },
  { id: 143, slug: "copa-del-rey", name: "Copa del Rey", country: "Espagne", type: "cup", enabled: true },
  // Italy
  { id: 135, slug: "serie-a", name: "Serie A", country: "Italie", type: "league", enabled: true },
  { id: 136, slug: "serie-b", name: "Serie B", country: "Italie", type: "league", enabled: true },
  { id: 137, slug: "coppa-italia", name: "Coppa Italia", country: "Italie", type: "cup", enabled: true },
  // Germany
  { id: 78, slug: "bundesliga", name: "Bundesliga", country: "Allemagne", type: "league", enabled: true },
  { id: 79, slug: "2-bundesliga", name: "2. Bundesliga", country: "Allemagne", type: "league", enabled: true },
  { id: 81, slug: "dfb-pokal", name: "DFB Pokal", country: "Allemagne", type: "cup", enabled: true },
  // Portugal
  { id: 94, slug: "liga-portugal", name: "Liga Portugal", country: "Portugal", type: "league", enabled: true },
  { id: 95, slug: "liga-portugal-2", name: "Liga Portugal 2", country: "Portugal", type: "league", enabled: true },
  { id: 96, slug: "taca-de-portugal", name: "Taça de Portugal", country: "Portugal", type: "cup", enabled: true },
  // Europe
  { id: 2, slug: "champions-league", name: "Champions League", country: "Europe", type: "european", enabled: true },
  { id: 3, slug: "europa-league", name: "Europa League", country: "Europe", type: "european", enabled: true },
  { id: 848, slug: "conference-league", name: "Conference League", country: "Europe", type: "european", enabled: true },
]

const BY_ID = new Map(COMPETITIONS.map((c) => [c.id, c]))
const BY_SLUG = new Map(COMPETITIONS.map((c) => [c.slug, c]))

export function enabledCompetitions(): CompetitionConfig[] {
  return COMPETITIONS.filter((c) => c.enabled)
}

export function enabledLeagueIds(): number[] {
  return enabledCompetitions().map((c) => c.id)
}

export function competitionById(leagueId: number): CompetitionConfig | undefined {
  return BY_ID.get(leagueId)
}

export function competitionBySlug(slug: string): CompetitionConfig | undefined {
  return BY_SLUG.get(slug)
}

/** True when a fixture's league is one RedMatch is configured to watch. */
export function isWatchedLeague(leagueId: number): boolean {
  return BY_ID.get(leagueId)?.enabled === true
}

/** Flag emoji used in alert formatting (spec sections 7 and 9). */
const COUNTRY_FLAGS: Record<string, string> = {
  Angleterre: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Espagne: "🇪🇸",
  Italie: "🇮🇹",
  Allemagne: "🇩🇪",
  Portugal: "🇵🇹",
  Europe: "🇪🇺",
}

export function countryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "⚽"
}
