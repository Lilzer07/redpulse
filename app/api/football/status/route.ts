// Integration health for the dashboard (spec section 20 checklist).
//
// Reports whether the API is genuinely reachable by making a real /status call.
// It never returns the key itself — only booleans and the account's own quota.
import { NextResponse } from "next/server"

import { fetchAccountStatus } from "@/lib/football/api"
import { hasApiKey } from "@/lib/football/client"
import { readMonitorState } from "@/lib/football/dedupe"
import { guardUserRequest } from "@/lib/api/guard"
import { enabledCompetitions } from "@/lib/football/competitions"

export const dynamic = "force-dynamic"

export async function GET() {
  const guard = await guardUserRequest()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const configured = hasApiKey()
  const monitorState = await readMonitorState()

  if (!configured) {
    return NextResponse.json({
      configured: false,
      reachable: false,
      error: "FOOTBALL_API_KEY is not set for this environment.",
      competitionsMonitored: enabledCompetitions().length,
      monitor: monitorState,
    })
  }

  const status = await fetchAccountStatus()

  return NextResponse.json({
    configured: true,
    reachable: status.ok,
    error: status.ok ? null : status.error,
    // Quota figures come straight from the provider so the dashboard shows real
    // consumption rather than an estimate.
    plan: status.ok ? status.plan : null,
    requests: status.ok ? status.requests : null,
    competitionsMonitored: enabledCompetitions().length,
    monitor: monitorState,
  })
}
