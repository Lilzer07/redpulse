// AI reading of a red card (spec section 8).
//
// Division of labour, and why it matters:
//   - `analyseRedCard` owns every NUMBER. It is deterministic and auditable, so a
//     published "59%" can be recomputed exactly.
//   - This module owns only the WORDS. The model receives the already-computed
//     figures and turns them into one sentence of context.
//
// The model is never asked to produce a probability. If it were, the same event
// could yield different percentages on each run and nothing could be audited.
import "server-only"

import { generateObject } from "ai"
import { z } from "zod"

import { logEvent } from "@/lib/logging"
import { formatScoreline } from "@/lib/telegram/format"
import type { RedCardAnalysis, RedCardEvent } from "@/lib/football/types"

/**
 * A fast, cheap model: this runs inside the monitoring cycle, which is already
 * time-boxed, and the task is one sentence of plain reasoning.
 */
const MODEL = "google/gemini-3.6-flash"

/**
 * Hard ceiling on the call. The monitor has a 60s budget shared with API-Football
 * and Telegram, so a slow model must never be what makes a run miss its window.
 */
const TIMEOUT_MS = 7_000

/** Keeps one bad generation from crowding out the figures in the message. */
const MAX_CHARS = 220

const schema = z.object({
  reading: z
    .string()
    .min(15)
    .max(MAX_CHARS)
    .describe("Une seule phrase en français expliquant l'effet de l'expulsion sur la suite du match."),
})

export type Commentary = { reading: string } | null

/**
 * Produces a one-sentence reading, or `null`.
 *
 * `null` is a first-class outcome, not an error path: when the gateway is
 * unavailable the alert still goes out with its deterministic figures and simply
 * omits the sentence. Inventing a fallback sentence here would put words in the
 * model's mouth, and blocking the alert would lose the time-critical part.
 */
export async function generateCommentary(event: RedCardEvent, analysis: RedCardAnalysis): Promise<Commentary> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema,
      abortSignal: controller.signal,
      // Low but non-zero: enough variety that every alert does not read like a
      // template, without wandering away from the supplied facts.
      temperature: 0.4,
      system: [
        "Tu es analyste football pour RedMatch, un service d'alertes de cartons rouges.",
        "On te fournit des faits de match et des probabilités DÉJÀ calculées.",
        "Règles absolues :",
        "- N'invente aucun chiffre, aucune statistique, aucun nom.",
        "- Ne cite aucun pourcentage : ils sont affichés séparément.",
        "- N'invente pas de blessure, de tactique ou d'historique que l'on ne te donne pas.",
        "- Une seule phrase, en français, factuelle et sobre. Pas d'emoji.",
      ].join("\n"),
      prompt: [
        `Compétition : ${event.leagueName} (${event.country})`,
        `Score au moment du carton : ${formatScoreline(event)}`,
        `Minute : ${event.minute}${event.minuteExtra ? `+${event.minuteExtra}` : ""}`,
        `Équipe réduite à dix : ${event.team}`,
        `Joueur expulsé : ${event.player}`,
        `Équipe désormais favorite (calcul RedMatch) : ${analysis.favorite}`,
        analysis.degraded
          ? "Attention : données de match partielles, reste prudent dans la formulation."
          : "Données de match complètes.",
        "",
        "Rédige la phrase de lecture du match.",
      ].join("\n"),
    })

    const reading = object.reading.trim()
    if (!reading) return null
    return { reading }
  } catch (error) {
    // Includes the abort case. Logged so a persistently failing gateway is
    // visible, then swallowed so the alert itself is unaffected.
    logEvent("ai_analysis_failed", {
      fixtureId: event.fixtureId,
      reason: error instanceof Error ? error.name : "unknown",
    })
    return null
  } finally {
    clearTimeout(timer)
  }
}
