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
 * Hard ceiling on a single attempt. The monitor has a 60s budget shared with
 * API-Football and Telegram, so a slow model must never make a run miss its
 * window — but red cards are rare (usually one per cycle), so we can afford a
 * generous per-attempt ceiling plus one retry and still stay well inside 60s.
 */
const TIMEOUT_MS = 9_000

/** One transient failure/timeout is retried; most gateway hiccups clear at once. */
const MAX_ATTEMPTS = 2

/** Keeps one bad generation from crowding out the figures in the message. */
const MAX_CHARS = 300

const schema = z.object({
  reading: z
    .string()
    .min(15)
    .max(MAX_CHARS)
    .describe(
      "Une à deux phrases en français, courtes et naturelles, expliquant l'effet concret de l'expulsion sur la suite du match, à partir des faits fournis.",
    ),
})

export type Commentary = { reading: string }

/**
 * Builds every fact fed to the model, DERIVED from data RedMatch already holds —
 * never invented. Shared by the model prompt and the deterministic fallback so
 * both describe the exact same situation.
 */
function buildContext(event: RedCardEvent, analysis: RedCardAnalysis) {
  const superiorTeam = event.team === event.homeTeam ? event.awayTeam : event.homeTeam
  const reducedScore = event.team === event.homeTeam ? event.homeScore : event.awayScore
  const opponentScore = event.team === event.homeTeam ? event.awayScore : event.homeScore
  const scoreContext =
    reducedScore > opponentScore
      ? `${event.team}, désormais à dix, mène au score`
      : reducedScore < opponentScore
        ? `${event.team}, désormais à dix, est menée au score`
        : "les deux équipes sont à égalité"
  const timeContext =
    event.minute < 90
      ? `environ ${90 - event.minute} minutes de jeu restantes (hors arrêts de jeu)`
      : "toute fin de match ou temps additionnel"
  // Probabilities are translated into qualitative bands rather than passed as
  // raw numbers: the model must not quote a percentage, so it never sees one.
  const band = (p: number) => (p >= 66 ? "élevé(e)" : p >= 33 ? "modéré(e)" : "faible")
  return { superiorTeam, reducedScore, opponentScore, scoreContext, timeContext, band }
}

/**
 * A deterministic, fact-only reading assembled from the same derived context.
 *
 * This is the guaranteed floor: the alert must ALWAYS carry a reading, so when
 * the gateway is unavailable or too slow we still describe the situation in
 * words — built strictly from figures RedMatch computed, never invented. It is
 * intentionally plain so a model-written sentence reads better when available.
 */
function deterministicReading(event: RedCardEvent, analysis: RedCardAnalysis): string {
  const { scoreContext, timeContext, superiorTeam } = buildContext(event, analysis)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const closeness = event.minute < 90 ? `Avec ${timeContext},` : "En toute fin de match,"
  // Masculine form, so it agrees with "potentiel" and reads cleanly in prose.
  const p = analysis.extraGoalProb
  const level = p >= 66 ? "élevé" : p >= 33 ? "modéré" : "faible"
  return [
    `${cap(scoreContext)}.`,
    `${closeness} ${superiorTeam} évolue en supériorité numérique et devient favori (calcul RedMatch).`,
    `Le potentiel d'un but supplémentaire est ${level}.`,
  ].join(" ")
}

/** One model attempt, hard-capped by TIMEOUT_MS. Returns null on any failure. */
async function attemptModelReading(event: RedCardEvent, analysis: RedCardAnalysis): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const { superiorTeam, scoreContext, timeContext, band } = buildContext(event, analysis)
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
        "Ton rôle : une lecture courte, naturelle et spécifique à CE match, qui aide à comprendre l'impact réel de l'expulsion.",
        "Règles absolues :",
        "- N'invente aucun chiffre, aucune statistique, aucun nom, aucun fait absent des données fournies.",
        "- Ne cite aucun pourcentage ni aucune valeur chiffrée : ils sont affichés séparément. Traduis-les en langage qualitatif (faible, élevé, très probable...).",
        "- N'invente pas de blessure, de tactique, de forme ou d'historique que l'on ne te donne pas.",
        "- Appuie-toi sur ce qui est réellement fourni : score, minute, temps restant, équipe réduite, équipe en supériorité, ampleur des probabilités.",
        "- Une à deux phrases maximum, en français, factuelles, sobres et fluides. Pas d'emoji, pas de liste, pas de pronostic ni de conseil de pari.",
      ].join("\n"),
      prompt: [
        `Compétition : ${event.leagueName} (${event.country})`,
        `Score au moment du carton : ${formatScoreline(event)}`,
        `Minute : ${event.minute}${event.minuteExtra ? `+${event.minuteExtra}` : ""}`,
        `Temps restant : ${timeContext}`,
        `Équipe réduite à dix : ${event.team}`,
        `Équipe désormais en supériorité numérique : ${superiorTeam}`,
        `Contexte du score : ${scoreContext}`,
        `Joueur expulsé : ${event.player}`,
        `Équipe désormais favorite (calcul RedMatch) : ${analysis.favorite}`,
        `Potentiel de but supplémentaire (niveau qualitatif) : ${band(analysis.extraGoalProb)}`,
        `Probabilité de victoire de ${analysis.favorite} (niveau qualitatif) : ${band(analysis.favoriteWinProb)}`,
        analysis.degraded
          ? "Attention : données de match partielles, reste prudent et nuancé dans la formulation."
          : "Données de match complètes.",
        "",
        "Rédige la lecture du match (une à deux phrases), spécifique à cette situation.",
      ].join("\n"),
    })
    const reading = object.reading.trim()
    return reading || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Produces a one-to-two-sentence reading for EVERY alert.
 *
 * The model is tried up to `MAX_ATTEMPTS` times; if it keeps failing (gateway
 * down, timeout, empty output) we fall back to a deterministic, fact-only
 * sentence so the "Lecture" section is never missing. The fallback quotes no
 * figure the model wasn't allowed to quote either — it only re-states, in words,
 * the situation RedMatch already computed.
 */
export async function generateCommentary(event: RedCardEvent, analysis: RedCardAnalysis): Promise<Commentary> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const reading = await attemptModelReading(event, analysis)
    if (reading) return { reading }
  }

  logEvent("ai_analysis_failed", { fixtureId: event.fixtureId, reason: "fallback_used" })
  return { reading: deterministicReading(event, analysis) }
}
