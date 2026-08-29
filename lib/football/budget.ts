// Daily API request budget (spec: stay inside the provider's quota).
//
// The project runs on API-Football's free tier: 100 requests per day, reset at
// midnight UTC. A monitor pass costs 1 request for the live-fixture list plus 1
// per live fixture inspected, so an unguarded pass during a busy Saturday can
// spend the whole day's quota in a single run and leave the service dead until
// midnight. Every request is therefore reserved before it is spent.
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Requests available per UTC day.
 *
 * Sized for a PAID API-Football plan, because the 60-second cadence in
 * MONITOR_CONFIG cannot fit in the free tier: the live-fixture list alone costs
 * 1440 requests/day at that rate, 14x the free allowance.
 *
 * Override with FOOTBALL_DAILY_REQUEST_BUDGET to match the plan actually
 * subscribed to, so switching tiers never requires a code change:
 *   free = 100 | Pro = 7500 | Ultra = 75000 | Mega = 150000
 *
 * This value is the real enforcement point. Lowering the cadence without
 * lowering this is safe; raising the cadence without raising this is not — the
 * budget simply runs out mid-afternoon and monitoring stops until midnight UTC.
 */
export const DAILY_REQUEST_BUDGET = readBudgetFromEnv() ?? 75000 // Ultra plan

/**
 * Requests deliberately left unspent by the monitor.
 *
 * Keeps headroom so the dashboard's own reachability check (and any manual
 * diagnosis) still works after the monitor has been running all day, rather than
 * every request being consumed by polling. Scaled as a small fraction of the
 * budget so it stays meaningful on a large plan without starving a small one.
 */
export const RESERVED_FOR_DIAGNOSTICS = Math.min(50, Math.max(5, Math.floor(DAILY_REQUEST_BUDGET * 0.005)))

/**
 * Reads the plan's daily allowance from the environment.
 *
 * Anything non-numeric or non-positive is ignored rather than trusted: a typo
 * that silently became 0 would halt monitoring entirely, and one that became a
 * huge number would overspend a paid plan.
 */
function readBudgetFromEnv(): number | null {
  const raw = process.env.FOOTBALL_DAILY_REQUEST_BUDGET
  if (!raw) return null
  const parsed = Number.parseInt(raw.trim(), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.log("[v0] FOOTBALL_DAILY_REQUEST_BUDGET is not a positive integer; falling back to the default.")
    return null
  }
  return parsed
}

/**
 * Reserves up to `wanted` requests, returning how many may actually be spent.
 *
 * Returns 0 when the budget is exhausted, which callers must treat as "do not
 * call the API" rather than as an error. Delegates to a SQL function that locks
 * the state row, so two concurrent monitor runs can never both claim the same
 * remaining request and overshoot the provider's limit.
 */
export async function reserveRequests(wanted: number): Promise<number> {
  if (wanted <= 0) return 0

  const supabase = createAdminClient()
  // Without service-role access the counter cannot be trusted, so nothing is
  // spent: silently polling here is what would blow the quota.
  if (!supabase) return 0

  const { data, error } = await supabase.rpc("reserve_api_requests", {
    wanted,
    daily_budget: Math.max(DAILY_REQUEST_BUDGET - RESERVED_FOR_DIAGNOSTICS, 0),
  })

  if (error) {
    console.log("[v0] budget reservation failed:", error.message)
    return 0
  }

  return typeof data === "number" ? data : 0
}

/** Current spend for today, for display. Never blocks or reserves anything. */
export async function readBudgetUsage(): Promise<{ used: number; budget: number } | null> {
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("monitor_state")
    .select("api_requests_used,api_quota_date")
    .eq("id", true)
    .maybeSingle()

  if (error || !data) return null

  // A stale quota date means the provider's day already rolled over and the
  // stored counter no longer applies, so report zero rather than yesterday's total.
  const today = new Date().toISOString().slice(0, 10)
  const used = data.api_quota_date === today ? (data.api_requests_used as number) : 0

  return { used, budget: DAILY_REQUEST_BUDGET }
}
