// Stripe Customer Portal (spec section 3: Stripe owns billing state).
//
// Card details, invoices and cancellation all live in Stripe, so RedMatch links
// out to the portal instead of rebuilding them. That is a correctness decision,
// not just less work: a card or invoice list rendered from our own tables would
// drift from Stripe the moment a payment failed or a card was replaced, and the
// dashboard would confidently show something false.
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { logEvent } from "@/lib/logging"
import { resolvePublicOrigin } from "./provision"
import { stripeClient } from "./sync"

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; reason: "not_configured" | "no_customer" | "stripe_error" }

/**
 * Opens a billing portal session for the signed-in user.
 *
 * The customer id is read from the database using the session user id — never
 * accepted from the client — so a caller cannot open someone else's billing
 * portal by passing another customer id.
 */
export async function createPortalSession(userId: string): Promise<PortalResult> {
  const stripe = stripeClient()
  if (!stripe) return { ok: false, reason: "not_configured" }

  const supabase = createAdminClient()
  if (!supabase) return { ok: false, reason: "stripe_error" }

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle()

  const customerId = data?.stripe_customer_id ? String(data.stripe_customer_id) : null
  // A lifetime buyer who paid through a one-off Payment Link may have no
  // customer to manage; that is a normal state, not an error to shout about.
  if (!customerId) return { ok: false, reason: "no_customer" }

  const origin = resolvePublicOrigin()

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      ...(origin ? { return_url: `${origin}/dashboard/billing` } : {}),
    })
    return { ok: true, url: session.url }
  } catch (error) {
    logEvent("stripe_portal_failed", {
      userId,
      reason: error instanceof Error ? error.message.slice(0, 120) : "unknown",
    })
    return { ok: false, reason: "stripe_error" }
  }
}
