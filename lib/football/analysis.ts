// Impact analysis of a red card (spec section 8).
//
// These numbers are RedMatch's own assessment, computed from the real match
// context returned by API-Football (score, minute, which side is down to ten).
// They are NOT returned by API-Football and must never be presented as such.
//
// The model is deterministic: the same event always yields the same analysis, so
// a stored result can be recomputed and audited. There is no randomness — an
// alert claiming "59%" has to mean something reproducible.
import type { RedCardAnalysis, RedCardEvent } from "./types"

/** Regulation length used to estimate remaining playing time. */
const FULL_TIME = 90
/** Goals per match across the covered leagues, used as the Poisson base rate. */
const GOALS_PER_MATCH = 2.75
/**
 * Uplift applied to the scoring rate once a side is down to ten men. Ten-man
 * matches see slightly more goals overall, since the extra space for the
 * eleven-man side outweighs its opponent's lost output.
 */
const TEN_MAN_UPLIFT = 1.15

/** API-Football statuses meaning the result is final. */
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"])

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(value)))

/**
 * Minutes of play still expected after the expulsion, including a nominal
 * allowance for stoppage time.
 */
function remainingMinutes(event: RedCardEvent): number {
  const played = event.minute + (event.minuteExtra ?? 0)
  if (FINISHED_STATUSES.has(event.fixtureStatus)) return 0
  // Half-time: the clock is stopped but the whole second half remains.
  const base = Math.max(0, FULL_TIME - played)
  return base + (base > 0 ? 4 : 0)
}

/**
 * Probability of at least one further goal, from a Poisson model on the
 * remaining time: P(N >= 1) = 1 - e^(-lambda).
 */
function extraGoalProbability(minutesLeft: number): number {
  if (minutesLeft <= 0) return 0
  const lambda = (minutesLeft / FULL_TIME) * GOALS_PER_MATCH * TEN_MAN_UPLIFT
  return (1 - Math.exp(-lambda)) * 100
}

/**
 * Probability that the eleven-man side wins.
 *
 * Time cuts both ways depending on the scoreline, so the three cases are modelled
 * separately: a lead becomes safer as the clock runs down, whereas a deficit or a
 * draw becomes harder to convert. Treating time as uniformly positive would
 * produce the absurd result that being level at 90' is as good as being level at
 * 20'.
 */
function favoriteWinProbability(goalDiff: number, minutesLeft: number, decided: boolean): number {
  // A finished match has no probability left to estimate: the result is known.
  // Without this, a card shown at the whistle would report "97%" for a team that
  // has already won outright.
  if (decided) return goalDiff > 0 ? 100 : 0

  const remaining = Math.max(0, Math.min(1, minutesLeft / FULL_TIME))

  if (goalDiff > 0) {
    // Leading: already likely, and safer as time runs out.
    const lead = Math.min(goalDiff, 3)
    const ceiling = 70 + lead * 7
    return ceiling + (1 - remaining) * (96 - ceiling)
  }

  if (goalDiff === 0) {
    // Level: must still score. The man advantage helps, but only while time remains.
    return 14 + remaining * 30
  }

  // Trailing: needs a comeback with a numerical advantage.
  const deficit = Math.min(-goalDiff, 3)
  const peak = 30 / deficit
  return 2 + remaining * (peak - 2)
}

/**
 * Confidence in the assessment, always on a 0-100 scale (spec section 8: never
 * "83/10").
 *
 * It reflects how much the model can actually rely on: complete input data, and
 * a situation whose outcome is not on a knife edge. A 0-0 with an hour left is
 * genuinely uncertain and should not claim high confidence.
 */
function confidenceScore(event: RedCardEvent, goalDiff: number, minutesLeft: number, degraded: boolean): number {
  let score = 58

  // Decisiveness of the current scoreline.
  score += Math.min(Math.abs(goalDiff), 3) * 7

  // A card with plenty of time left has a clearer effect on the match than one
  // shown in stoppage time, where little can still change.
  const remaining = Math.max(0, Math.min(1, minutesLeft / FULL_TIME))
  score += remaining * 16

  // Data completeness.
  if (event.player !== "Joueur inconnu") score += 6
  if (event.minute > 0) score += 4
  if (degraded) score -= 18

  return clamp(score, 25, 96)
}

/**
 * Builds the analysis for a detected expulsion.
 *
 * `degraded` marks analyses computed without a reliable minute, so the UI and the
 * Telegram message can stay honest about reduced certainty instead of silently
 * presenting a weaker estimate as a firm one.
 */
export function analyseRedCard(event: RedCardEvent): RedCardAnalysis {
  // The favourite is the side that keeps eleven players: the opponent of the
  // carded team. Team names come from the fixture, so compare against both.
  const cardedIsHome = event.team === event.homeTeam
  const cardedIsAway = event.team === event.awayTeam

  // If the event's team matches neither side, the feed is inconsistent; fall back
  // to the away team as favourite only after flagging the analysis as degraded.
  const unresolvedTeam = !cardedIsHome && !cardedIsAway
  const favorite = cardedIsHome ? event.awayTeam : event.homeTeam
  const favoriteScore = cardedIsHome ? event.awayScore : event.homeScore
  const cardedScore = cardedIsHome ? event.homeScore : event.awayScore

  const minutesLeft = remainingMinutes(event)
  const degraded = unresolvedTeam || event.minute === 0
  const goalDiff = favoriteScore - cardedScore
  const decided = FINISHED_STATUSES.has(event.fixtureStatus)

  return {
    favorite,
    extraGoalProb: clamp(extraGoalProbability(minutesLeft), 0, 100),
    favoriteWinProb: clamp(favoriteWinProbability(goalDiff, minutesLeft, decided), 0, 100),
    confidence: confidenceScore(event, goalDiff, minutesLeft, degraded),
    degraded,
  }
}
