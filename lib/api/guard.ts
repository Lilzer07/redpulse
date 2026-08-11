// Route protection for the sensitive server endpoints (spec section 18).
import "server-only"

import { createClient } from "@/lib/supabase/server"

export type GuardFailure = { ok: false; status: number; error: string }
export type UserGuardSuccess = { ok: true; userId: string }

/**
 * Guards machine-triggered endpoints (the monitoring loop, the expiry sweep).
 *
 * Requires `CRON_SECRET` as a bearer token. If the variable is not configured the
 * route is refused rather than left open: an unprotected endpoint that triggers
 * real Telegram sends and burns API quota is worse than one that is temporarily
 * unavailable. Vercel Cron sends this header automatically once the variable
 * exists.
 */
export function guardMachineRequest(request: Request): { ok: true } | GuardFailure {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "CRON_SECRET is not configured. Set it before enabling the monitoring endpoint.",
    }
  }

  const header = request.headers.get("authorization") ?? ""
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : ""

  // Length-independent comparison isn't available in the edge/node overlap, but
  // the secret is high-entropy and never echoed back, so a plain compare is fine.
  if (!provided || provided !== secret) {
    return { ok: false, status: 401, error: "Unauthorized." }
  }

  return { ok: true }
}

/** Guards user-facing endpoints: requires a valid Supabase session. */
export async function guardUserRequest(): Promise<UserGuardSuccess | GuardFailure> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, status: 401, error: "Not signed in." }
  return { ok: true, userId: user.id }
}
