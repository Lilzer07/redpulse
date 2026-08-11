// Shapes of the API-Football v3 payloads RedMatch consumes.
//
// Every field is optional/nullable on purpose: API-Football omits keys rather
// than sending nulls in several endpoints, and the spec (section 18) requires
// validating incoming data instead of trusting it. Parsing happens in
// `parseFixture` / `parseEvent`, which turn these loose shapes into the strict
// internal types below.

export type ApiEnvelope<T> = {
  get?: string
  errors?: unknown
  results?: number
  paging?: { current?: number; total?: number }
  response?: T
}

export type RawFixture = {
  fixture?: {
    id?: number
    date?: string
    status?: { short?: string; long?: string; elapsed?: number | null; extra?: number | null }
  }
  league?: { id?: number; name?: string; country?: string; season?: number; round?: string }
  teams?: { home?: { id?: number; name?: string }; away?: { id?: number; name?: string } }
  goals?: { home?: number | null; away?: number | null }
}

export type RawEvent = {
  time?: { elapsed?: number | null; extra?: number | null }
  team?: { id?: number; name?: string }
  player?: { id?: number | null; name?: string | null }
  assist?: { id?: number | null; name?: string | null }
  type?: string
  detail?: string
  comments?: string | null
}

export type RawLeague = {
  league?: { id?: number; name?: string; type?: string }
  country?: { name?: string }
  seasons?: { year?: number; current?: boolean; start?: string; end?: string }[]
}

// --- Internal, validated types ---------------------------------------------

/** A live fixture in one of the watched competitions. */
export type Fixture = {
  id: number
  leagueId: number
  leagueName: string
  country: string
  season: number | null
  /** API-Football short status: 1H, HT, 2H, ET, BT, P, LIVE, FT... */
  status: string
  /** Minutes played, when the API reports it. */
  elapsed: number | null
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
}

/** A validated match event. */
export type FixtureEvent = {
  minute: number
  minuteExtra: number | null
  team: string
  teamId: number | null
  player: string
  playerId: number | null
  type: string
  detail: string
}

/**
 * A red card detected by RedMatch, before analysis. `eventKey` is the
 * deduplication identity (spec section 5).
 */
export type RedCardEvent = {
  eventKey: string
  fixtureId: number
  leagueId: number
  leagueName: string
  country: string
  season: number | null
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  player: string
  team: string
  minute: number
  minuteExtra: number | null
  detail: string
  fixtureStatus: string
  detectedAt: string
}

/** Output of the impact analysis (spec section 8). */
export type RedCardAnalysis = {
  /** Team favoured to win after the expulsion. */
  favorite: string
  /** Probability (%) of at least one further goal. 0-100. */
  extraGoalProb: number
  /** Probability (%) that `favorite` wins. 0-100. */
  favoriteWinProb: number
  /** Confidence of the analysis, always out of 100 — never out of 10. */
  confidence: number
  /**
   * True when the analysis had to fall back to context-only reasoning because
   * team statistics were unavailable (spec section 8: handle missing data
   * cleanly rather than inventing numbers).
   */
  degraded: boolean
}

export type RedCardWithAnalysis = RedCardEvent & { analysis: RedCardAnalysis }
