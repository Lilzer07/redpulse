// Alert formatting (spec sections 7 and 9).
//
// Pure string building, deliberately free of any network or env access so the
// exact output can be asserted in isolation. Shared by the Telegram message and
// the dashboard, so both always read identically.
import { countryFlag } from "@/lib/football/competitions"
import type { RedCardAnalysis, RedCardEvent } from "@/lib/football/types"

/** "67’" or "90+3’" when the API reports stoppage time. */
export function formatMinute(minute: number, minuteExtra: number | null): string {
  return minuteExtra && minuteExtra > 0 ? `${minute}+${minuteExtra}’` : `${minute}’`
}

export function formatScoreline(event: Pick<RedCardEvent, "homeTeam" | "awayTeam" | "homeScore" | "awayScore">): string {
  // En dash without surrounding spaces ("1–0") keeps the line compact on mobile.
  return `${event.homeTeam} ${event.homeScore}–${event.awayScore} ${event.awayTeam}`
}

/**
 * The analysis block.
 *
 * Confidence is always rendered out of 100 — the spec calls this out explicitly
 * ("83/100", never "83/10").
 */
export function formatAnalysisBlock(analysis: RedCardAnalysis): string {
  const lines = [
    `⚽ But supplémentaire : ${analysis.extraGoalProb} %`,
    `🏆 Victoire ${analysis.favorite} : ${analysis.favoriteWinProb} %`,
    `🎯 Confiance : ${analysis.confidence}/100`,
  ]
  // Stay honest when the estimate rests on incomplete match data rather than
  // presenting a weaker figure with the same authority as a solid one.
  if (analysis.degraded) lines.push("Données de match partielles : estimation indicative.")
  return lines.join("\n")
}

/**
 * The full Telegram message.
 *
 * Sent as plain text (no parse_mode) on purpose: team and player names come from
 * a third party and regularly contain characters that are Markdown/HTML control
 * sequences. Plain text removes any need to escape them and makes a malformed
 * name incapable of breaking or injecting into the message.
 */
export function formatTelegramAlert(
  event: RedCardEvent,
  analysis: RedCardAnalysis,
  /**
   * Optional one-sentence AI reading. Absent when the gateway was unavailable,
   * in which case the alert simply ships without it.
   */
  aiReading?: string | null,
): string {
  const lines = [
    "🚨 CARTON ROUGE",
    "",
    `${countryFlag(event.country)} ${event.leagueName}`,
    "",
    formatScoreline(event),
    "",
    `🔴 Joueur : ${event.player}`,
    `⏱️ ${formatMinute(event.minute, event.minuteExtra)}`,
    // Always name the team reduced to ten so the alert is unambiguous.
    `👥 Expulsion : ${event.team}`,
    "",
    // The figures below come from RedMatch's deterministic model, not from a
    // language model. Labelling them "Analyse IA" would misattribute them, so
    // the AI sentence gets its own clearly separated section instead.
    "📊 Analyse RedMatch",
    "",
    formatAnalysisBlock(analysis),
  ]

  // Header sits directly above the sentence (no blank line between) to keep the
  // reading tight against its label.
  if (aiReading) lines.push("", "🤖 Lecture", aiReading)

  return lines.join("\n")
}
