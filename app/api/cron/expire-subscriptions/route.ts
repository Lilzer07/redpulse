// Subscription expiry sweep (spec section 13).
//
// Marks lapsed subscriptions expired and revokes their Telegram access in one
// SQL transaction. Machine-only, same protection as the monitoring loop.
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
