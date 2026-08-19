// Subscription expiry sweep (spec section 13).
//
// Two ordered stages: (1) mark lapsed subscriptions expired in SQL, then
// (2) kick from the Telegram channel every user who is no longer entitled —
// the enforcement Postgres cannot do itself. Machine-only, same protection as
// the monitoring loop. Scheduled daily in vercel.json (Hobby allows 1/day).
import { NextResponse } from "next/server"

import { guardMachineRequest } from "@/lib/api/guard"
import { runExpirySweep } from "@/lib/subscriptions/authorization"

export const dynamic = "force-dynamic"

async function handle(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const result = await runExpirySweep()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

export const GET = handle
export const POST = handle
