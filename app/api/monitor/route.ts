// The monitoring loop trigger (spec section 6).
//
// Machine-only: it consumes API quota and sends real Telegram messages, so it is
// behind `CRON_SECRET` and never callable from the browser.
import { NextResponse } from "next/server"

import { guardMachineRequest } from "@/lib/api/guard"
import { MONITOR_CONFIG, runMonitorCycle } from "@/lib/football/monitor"

export const dynamic = "force-dynamic"
// A busy matchday can mean dozens of fixtures; give the cycle room to finish.
export const maxDuration = 60

async function handle(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const result = await runMonitorCycle()

  return NextResponse.json(
    {
      ok: result.ok,
      skipped: result.skipped ?? null,
      matchesWatched: result.matchesWatched,
      redCardsFound: result.redCardsFound,
      // Only the newly claimed expulsions — already-alerted ones are omitted so
      // the response reflects what this run actually acted on.
      newRedCards: result.newRedCards.map((card) => ({
        fixtureId: card.fixtureId,
        competition: card.leagueName,
        match: `${card.homeTeam} ${card.homeScore}-${card.awayScore} ${card.awayTeam}`,
        player: card.player,
        team: card.team,
        minute: card.minute,
        analysis: card.analysis,
      })),
      deliveries: result.deliveries,
      intervalSeconds: MONITOR_CONFIG.intervalSeconds,
      error: result.error ?? null,
    },
    // A missing key is a configuration problem on our side (503), not a failure
    // of the upstream provider (502). A "locked" run is a normal no-op and
    // already reports ok, so it stays 200 and never alarms the cron monitor.
    { status: result.ok ? 200 : result.skipped === "no_api_key" ? 503 : 502 },
  )
}

// GET so Vercel Cron can call it; POST for manual triggering.
export const GET = handle
export const POST = handle
