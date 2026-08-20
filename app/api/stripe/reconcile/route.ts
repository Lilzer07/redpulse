// Stripe reconciliation endpoint.
//
// Re-reads every stored subscription from Stripe and re-applies its true state,
// cancellation included. This is the catch-up path for rows a webhook set wrong
// or never received — notably subscriptions the user resiliated under the old
// rule that ignored "cancel at period end", which stay active with a future
// period end and are therefore never corrected by the daily expiry sweep.
//
// Machine-only: same CRON_SECRET protection as the monitoring loop and the
// expiry sweep. Trigger it once (Authorization: Bearer <CRON_SECRET>) to heal
// the current state; the webhook fix keeps future cancellations instant.
import { NextResponse } from "next/server"

import { guardMachineRequest } from "@/lib/api/guard"
import { reconcileAllFromStripe } from "@/lib/stripe/sync"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function handle(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const result = await reconcileAllFromStripe()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}

export const GET = handle
export const POST = handle
