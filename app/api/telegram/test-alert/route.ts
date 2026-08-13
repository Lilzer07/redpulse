// Manual end-to-end Telegram test (send a fake red-card alert to the channel).
//
// WHY THIS EXISTS
// Verifying the Telegram delivery chain otherwise means waiting for a real
// expulsion during a live match. This route lets an operator publish one alert
// on demand, through the EXACT path a real alert takes — analyse → AI reading →
// format → publish to the private channel — so what lands in Telegram is
// byte-for-byte the real format.
//
// WHAT IT DELIBERATELY DOES NOT DO
//   - It does not call API-Football and does not reserve any request budget:
//     the fixture is synthetic, so the daily quota is untouched.
//   - It does not go through claimRedCard / markDispatched / recordUserAlert:
//     no deduplication row and no user history are written, so a test can be run
//     any number of times and never pollutes real alert history or blocks a real
//     expulsion with the same key.
//   - It does not touch Stripe, Supabase auth, or the monitoring loop.
//
// SAFETY
//   - Machine-only, behind the same CRON_SECRET bearer guard as /api/monitor and
//     /api/telegram/setup. It can never be triggered from a browser and never
//     fires on its own — there is no cron and no automatic caller.
//   - The fixture uses openly fictional team and player names so that, even
//     though the FORMAT is identical to a real alert, no channel member can
//     mistake it for a genuine red card.
//
//   GET  → compose and RETURN the message without sending (dry-run preview).
//   POST → compose and PUBLISH it to the private channel.
import { NextResponse } from "next/server"

import { guardMachineRequest } from "@/lib/api/guard"
import { analyseRedCard } from "@/lib/football/analysis"
import { competitionById } from "@/lib/football/competitions"
import type { RedCardEvent } from "@/lib/football/types"
import { generateCommentary } from "@/lib/ai/commentary"
import { formatTelegramAlert } from "@/lib/telegram/format"
import { sendChannelMessage } from "@/lib/telegram/service"
import { logEvent } from "@/lib/logging"

export const dynamic = "force-dynamic"

/**
 * A synthetic expulsion in a real watched competition.
 *
 * The league id is real (Ligue 1) so the flag + competition line renders exactly
 * as in production; the club and player names are obviously fictional so the post
 * reads as a test to anyone in the channel. The scoreline and minute are chosen
 * to give the deterministic model non-trivial numbers to render.
 */
function buildFakeEvent(): RedCardEvent {
  const now = new Date()
  return {
    // A stable, clearly-marked key. It is never persisted by this route, but a
    // recognisable value keeps logs readable if it ever surfaces.
    eventKey: `test-alert:${now.toISOString().slice(0, 10)}`,
    fixtureId: 900000000,
    leagueId: 61, // Ligue 1 — a real, watched competition.
    leagueName: "Ligue 1",
    country: "France",
    season: now.getUTCFullYear(),
    homeTeam: "Testville FC",
    awayTeam: "Démo Rovers",
    homeScore: 1,
    awayScore: 1,
    player: "Joueur Test",
    team: "Testville FC",
    minute: 63,
    minuteExtra: null,
    detail: "Red Card",
    fixtureStatus: "2H",
    detectedAt: now.toISOString(),
  }
}

/**
 * Composes the alert exactly as the monitor's `dispatch` does: real analysis,
 * real (best-effort) AI reading, real formatter. Returns the finished text so
 * both GET (preview) and POST (send) share one code path.
 */
async function composeTestAlert(): Promise<string> {
  const event = buildFakeEvent()
  const analysis = analyseRedCard(event)
  // Same as production: a gateway failure yields null and the alert simply ships
  // without the AI line, rather than blocking the send.
  const commentary = await generateCommentary(event, analysis)
  return formatTelegramAlert(event, analysis, commentary?.reading ?? null)
}

export async function GET(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const message = await composeTestAlert()
  return NextResponse.json({
    ok: true,
    sent: false,
    note: "Dry run: this is the exact message a POST would publish. Nothing was sent.",
    message,
  })
}

export async function POST(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const message = await composeTestAlert()
  const publication = await sendChannelMessage(message)

  if (!publication.ok) {
    logEvent("telegram_test_alert_failed", {
      reason: publication.reason === "not_configured" ? "channel_not_configured" : publication.detail,
    })
    return NextResponse.json(
      {
        ok: false,
        sent: false,
        // "not_configured" here means the channel id is not yet known: the bot
        // must be an administrator of the channel (see /api/telegram/setup).
        error:
          publication.reason === "not_configured"
            ? "Channel not configured: the bot must be an administrator of the private channel (check /api/telegram/setup)."
            : publication.detail,
        message,
      },
      { status: publication.reason === "not_configured" ? 409 : 502 },
    )
  }

  logEvent("telegram_test_alert_sent", {})
  return NextResponse.json({
    ok: true,
    sent: true,
    note: "Published to the private channel. Open Telegram to confirm it arrived.",
    message,
  })
}
