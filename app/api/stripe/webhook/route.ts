// Stripe webhook (spec section 3).
//
// This is the ONLY place premium access is granted. Reaching a success page
// proves nothing; only a Stripe-signed event does. The raw body is required for
// signature verification, so it is read as text before any parsing.
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { effectiveSubscriptionStatus, periodEndOf, resolveUserId, stripeClient, syncSubscription } from "@/lib/stripe/sync"
import { getWebhookSigningSecret } from "@/lib/stripe/provision"
import { logEvent } from "@/lib/logging"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const stripe = stripeClient()
  // Either an operator-provided env var or the secret the app provisioned for
  // itself against Stripe. Verification is never skipped when it is missing.
  const webhookSecret = await getWebhookSigningSecret()

  // Without a key or secret we cannot verify anything, and an unverified event
  // must never grant access — so refuse instead of guessing.
  if (!stripe || !webhookSecret) {
    // Name the missing piece: "no secret" and "no API key" have different fixes,
    // and a generic message makes production debugging guesswork.
    logEvent("stripe_webhook_rejected", {
      reason: "not_configured",
      missing: !stripe ? "stripe_api_key" : "signing_secret",
    })
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    logEvent("stripe_webhook_rejected", { reason: "missing_signature" })
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 })
  }

  const raw = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret)
  } catch {
    logEvent("stripe_webhook_rejected", { reason: "bad_signature" })
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 })
  }

  logEvent("stripe_webhook_received", { type: event.type, id: event.id })

  try {
    switch (event.type) {
      // ---- initial purchase -------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = await resolveUserId({
          clientReferenceId: session.client_reference_id,
          customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          email: session.customer_details?.email ?? session.customer_email,
        })
        if (!userId) break

        // A one-off payment (lifetime plan) has no subscription object, so it is
        // treated as permanently active with no period end.
        if (session.mode === "payment") {
          await syncSubscription({
            userId,
            plan: "lifetime",
            status: "active",
            currentPeriodEnd: null,
            customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          })
          break
        }

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id
        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        await syncSubscription({
          userId,
          plan: "monthly",
          status: sub.status,
          currentPeriodEnd: periodEndOf(sub),
          customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          subscriptionId: sub.id,
        })
        break
      }

      // ---- creation, renewal, status change, cancellation -------------------
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id
        const userId = await resolveUserId({ customerId })
        if (!userId) break

        // Cancellation cuts access the instant the user resiliates, including
        // Stripe's "cancel at period end" variant that otherwise stays active
        // until the term ends. See effectiveSubscriptionStatus for the rules.
        const status = effectiveSubscriptionStatus(sub, {
          deleted: event.type === "customer.subscription.deleted",
        })

        await syncSubscription({
          userId,
          status,
          currentPeriodEnd: periodEndOf(sub),
          customerId,
          subscriptionId: sub.id,
        })
        break
      }

      // ---- successful renewal ----------------------------------------------
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
        const userId = await resolveUserId({ customerId, email: invoice.customer_email })
        if (!userId) break

        const subscriptionId = subscriptionIdOf(invoice)
        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        await syncSubscription({
          userId,
          status: sub.status,
          currentPeriodEnd: periodEndOf(sub),
          customerId,
          subscriptionId: sub.id,
        })
        break
      }

      // ---- failed payment: withdraw access ---------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
        const userId = await resolveUserId({ customerId, email: invoice.customer_email })
        if (!userId) break

        await syncSubscription({ userId, status: "past_due", currentPeriodEnd: null, customerId })
        break
      }

      default:
        break
    }
  } catch (error) {
    // Report a failure so Stripe retries, but never grant access on error.
    logEvent("stripe_webhook_rejected", {
      reason: "handler_error",
      detail: error instanceof Error ? error.message : "unknown",
    })
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

/** Reads the subscription id off an invoice across Stripe API shapes. */
function subscriptionIdOf(invoice: Stripe.Invoice): string | null {
  const direct = (invoice as unknown as { subscription?: string | { id?: string } }).subscription
  if (typeof direct === "string") return direct
  if (direct?.id) return direct.id

  const fromLine = invoice.lines?.data?.[0] as unknown as { subscription?: string | { id?: string } } | undefined
  const nested = fromLine?.subscription
  if (typeof nested === "string") return nested
  return nested?.id ?? null
}
