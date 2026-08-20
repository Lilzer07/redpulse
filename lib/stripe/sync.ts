// Stripe -> RedMatch subscription sync (spec sections 3, 4 and 6).
//
// Stripe is the single source of truth for entitlement. Every write to
// `subscriptions` happens here, and every write immediately reconciles Telegram
// channel membership, so billing state and channel access can never disagree.
import "server-only"

import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { grantChannelAccess, revokeChannelAccess } from "@/lib/telegram/access"
import { sendMessage } from "@/lib/telegram/service"
import { logEvent } from "@/lib/logging"

/** Lazily built so a missing key degrades gracefully instead of crashing boot. */
export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) return null
  return new Stripe(key)
}

/** Stripe statuses that grant access. Everything else is inactive. */
const ACTIVE = new Set(["active", "trialing"])

/** Maps a Stripe subscription status onto our own two-state model. */
export function toAccessStatus(stripeStatus: string): "active" | "inactive" {
  return ACTIVE.has(stripeStatus) ? "active" : "inactive"
}

/**
 * The status we persist for a Stripe subscription, cancellation-aware.
 *
 * A deleted subscription is terminal. Just as important: Stripe's default
 * "cancel at period end" keeps the subscription `active` (with
 * `cancel_at_period_end: true`) until the paid term ends, but RedMatch cuts
 * access the instant the user resiliates — so a scheduled cancellation is
 * reported as `canceled` immediately. Removing that schedule (reactivation)
 * clears both flags and restores the live Stripe status.
 */
export function effectiveSubscriptionStatus(sub: Stripe.Subscription, opts?: { deleted?: boolean }): string {
  if (opts?.deleted) return "canceled"
  if (sub.cancel_at_period_end === true || sub.cancel_at !== null) return "canceled"
  return sub.status
}

/**
 * Finds the RedMatch user for a Stripe event.
 *
 * Preference order matters: `client_reference_id` is what we put on the payment
 * link ourselves and is therefore the only fully reliable key. The customer id
 * works for renewals, and email is the last resort because two Stripe customers
 * can share one address.
 */
export async function resolveUserId(input: {
  clientReferenceId?: string | null
  customerId?: string | null
  email?: string | null
}): Promise<string | null> {
  const supabase = createAdminClient()
  if (!supabase) return null

  if (input.clientReferenceId) return input.clientReferenceId

  if (input.customerId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", input.customerId)
      .maybeSingle()
    if (data?.user_id) return String(data.user_id)
  }

  if (input.email) {
    // Look the account up by its auth email via the admin API.
    const url = process.env.SUPABASE_URL?.trim()
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (url && key) {
      try {
        const res = await fetch(`${url}/auth/v1/admin/users?filter=${encodeURIComponent(input.email)}`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          cache: "no-store",
        })
        const payload = (await res.json().catch(() => null)) as { users?: Array<{ id?: string; email?: string }> } | null
        const match = payload?.users?.find((u) => u.email?.toLowerCase() === input.email?.toLowerCase())
        if (match?.id) return match.id
      } catch {
        // Fall through: an email lookup failure must not activate anything.
      }
    }
  }

  return null
}

export type SyncInput = {
  userId: string
  plan?: string | null
  status: string
  currentPeriodEnd?: string | null
  customerId?: string | null
  subscriptionId?: string | null
}

/**
 * Writes the authoritative subscription state, then reconciles channel access.
 *
 * Granting is attempted only for entitled users; revocation runs for everyone
 * else, which is what makes cancellation, expiry and failed payment all end in
 * the user leaving the channel without any extra code path.
 */
export async function syncSubscription(input: SyncInput): Promise<{ ok: boolean }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false }

  const access = toAccessStatus(input.status)

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: input.userId,
      // Keep the existing plan label when Stripe does not tell us a new one.
      ...(input.plan ? { plan: input.plan } : {}),
      status: access === "active" ? "active" : input.status,
      current_period_end: input.currentPeriodEnd ?? null,
      ...(input.customerId ? { stripe_customer_id: input.customerId } : {}),
      ...(input.subscriptionId ? { stripe_subscription_id: input.subscriptionId } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )
  if (error) return { ok: false }

  logEvent("stripe_subscription_updated", {
    userId: input.userId,
    status: input.status,
    access,
    subscriptionId: input.subscriptionId ?? null,
  })

  if (access === "active") {
    const grant = await grantChannelAccess(input.userId)
    // Push the personal invite straight to the user when they are already linked.
    if (grant.ok && !grant.reused) {
      const chatId = await lookupChatId(input.userId)
      if (chatId) {
        await sendMessage(
          chatId,
          `Abonnement confirmé.\n\nVoici votre lien d'accès personnel au canal privé RedMatch Alertes :\n${grant.inviteLink}\n\nOuvrez-le puis validez la demande d'adhésion : l'accès est accordé automatiquement. Ce lien est personnel, à usage unique, et expire sous 15 minutes.`,
        )
      }
    }
  } else {
    await revokeChannelAccess(input.userId, `stripe_status:${input.status}`)
    const chatId = await lookupChatId(input.userId)
    if (chatId) {
      await sendMessage(
        chatId,
        "Votre abonnement RedMatch n'est plus actif : l'accès au canal d'alertes a été retiré. Réactivez-le depuis votre tableau de bord pour retrouver vos alertes.",
      )
    }
  }

  return { ok: true }
}

/** Reads the user's DM chat id, used for lifecycle notices. */
async function lookupChatId(userId: string): Promise<string | null> {
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data } = await supabase.from("telegram_settings").select("chat_id").eq("user_id", userId).maybeSingle()
  return (data?.chat_id as string | null) ?? null
}

/**
 * Re-reads live state from Stripe and re-applies it (admin "Synchroniser Stripe").
 * Useful when a webhook was missed while the app was down.
 */
export async function resyncFromStripe(userId: string): Promise<{ ok: boolean; detail: string }> {
  const stripe = stripeClient()
  if (!stripe) return { ok: false, detail: "STRIPE_SECRET_KEY manquante" }

  const supabase = createAdminClient()
  if (!supabase) return { ok: false, detail: "Base indisponible" }

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle()

  const subscriptionId = data?.stripe_subscription_id as string | null
  const customerId = data?.stripe_customer_id as string | null

  try {
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const status = effectiveSubscriptionStatus(sub)
      await syncSubscription({
        userId,
        status,
        currentPeriodEnd: periodEndOf(sub),
        customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        subscriptionId: sub.id,
      })
      return { ok: true, detail: `Statut Stripe : ${status}` }
    }

    if (customerId) {
      const list = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 })
      const sub = list.data[0]
      if (!sub) return { ok: true, detail: "Aucun abonnement Stripe pour ce client" }
      const status = effectiveSubscriptionStatus(sub)
      await syncSubscription({
        userId,
        status,
        currentPeriodEnd: periodEndOf(sub),
        customerId,
        subscriptionId: sub.id,
      })
      return { ok: true, detail: `Statut Stripe : ${status}` }
    }

    return { ok: true, detail: "Aucune référence Stripe enregistrée" }
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "Erreur Stripe" }
  }
}

/**
 * Re-reads every stored subscription from Stripe and re-applies its true state.
 *
 * This heals rows that a webhook set (or failed to set) under the old rule that
 * ignored "cancel at period end": a subscription the user already resiliated
 * stays `active` in our table with a future period end, so neither a new webhook
 * (none will fire) nor the expiry sweep (period end is not past) corrects it.
 * Running this once reconciles them, and it is safe to run repeatedly.
 */
export async function reconcileAllFromStripe(): Promise<{
  ok: boolean
  checked: number
  updated: number
  error?: string
}> {
  const stripe = stripeClient()
  if (!stripe) return { ok: false, checked: 0, updated: 0, error: "STRIPE_SECRET_KEY manquante" }

  const supabase = createAdminClient()
  if (!supabase) return { ok: false, checked: 0, updated: 0, error: "Base indisponible" }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, stripe_subscription_id")
    .not("stripe_subscription_id", "is", null)

  if (error) return { ok: false, checked: 0, updated: 0, error: error.message }
  const rows = data ?? []

  let updated = 0
  for (const row of rows) {
    const subscriptionId = row.stripe_subscription_id as string
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      await syncSubscription({
        userId: String(row.user_id),
        status: effectiveSubscriptionStatus(sub),
        currentPeriodEnd: periodEndOf(sub),
        customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        subscriptionId: sub.id,
      })
      updated += 1
    } catch {
      // A single bad subscription id must not abort the whole reconciliation.
    }
  }

  logEvent("stripe_reconciled", { checked: rows.length, updated })
  return { ok: true, checked: rows.length, updated }
}

/**
 * Reads the current period end off a subscription.
 *
 * Recent Stripe API versions moved this onto the subscription items, so we check
 * the item first and fall back to the legacy top-level field.
 */
export function periodEndOf(sub: Stripe.Subscription): string | null {
  const fromItem = sub.items?.data?.[0]?.current_period_end
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end
  const seconds = fromItem ?? legacy
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null
}

/**
 * Voluntarily cancels the signed-in user's subscription with IMMEDIATE effect.
 *
 * A voluntary cancellation is authoritative and instant: the user loses access
 * the moment they confirm, even with paid days remaining. Two things happen, in
 * this order, and the local revoke is what actually decides access:
 *
 *   1. Best-effort IMMEDIATE cancellation in Stripe (`subscriptions.cancel`, not
 *      `cancel_at_period_end`) so Stripe's own status becomes `canceled` with no
 *      lingering paid period. A Stripe error must NOT keep the user entitled, so
 *      it is swallowed — step 2 still runs.
 *   2. An explicit revoked state is forced locally: `status: "canceled"` AND
 *      `current_period_end: null`. Nulling the period end means no gate can ever
 *      re-grant access from a future paid date, and `syncSubscription` revokes
 *      the Telegram channel in the same call. This is what makes the cut server-
 *      side and immediate, independent of any webhook or the daily cron.
 *
 * The subscription id is read from the database by user id — never taken from
 * the client — so a caller cannot cancel someone else's subscription.
 */
export async function cancelUserSubscription(
  userId: string,
): Promise<{ ok: true } | { ok: false; reason: "no_subscription" | "storage_unavailable" }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, reason: "storage_unavailable" }

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data) return { ok: false, reason: "no_subscription" }

  const subscriptionId = data.stripe_subscription_id ? String(data.stripe_subscription_id) : null
  const customerId = data.stripe_customer_id ? String(data.stripe_customer_id) : null

  // 1. Immediate Stripe cancellation, best-effort.
  const stripe = stripeClient()
  if (stripe && subscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscriptionId)
    } catch {
      // Already canceled or a transient Stripe error: the forced local revoke
      // below is authoritative, so the user still loses access immediately.
    }
  }

  // 2. Force the explicit revoked state + Telegram kick, regardless of Stripe.
  await syncSubscription({
    userId,
    status: "canceled",
    currentPeriodEnd: null,
    ...(customerId ? { customerId } : {}),
    ...(subscriptionId ? { subscriptionId } : {}),
  })

  logEvent("subscription_canceled_by_user", { userId, subscriptionId })
  return { ok: true }
}
