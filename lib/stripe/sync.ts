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
          `Abonnement confirmé.\n\nVoici votre lien d'accès personnel au canal privé RedMatch Alertes :\n${grant.inviteLink}\n\nCe lien est à usage unique et expire sous 24 h.`,
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
      await syncSubscription({
        userId,
        status: sub.status,
        currentPeriodEnd: periodEndOf(sub),
        customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        subscriptionId: sub.id,
      })
      return { ok: true, detail: `Statut Stripe : ${sub.status}` }
    }

    if (customerId) {
      const list = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 })
      const sub = list.data[0]
      if (!sub) return { ok: true, detail: "Aucun abonnement Stripe pour ce client" }
      await syncSubscription({
        userId,
        status: sub.status,
        currentPeriodEnd: periodEndOf(sub),
        customerId,
        subscriptionId: sub.id,
      })
      return { ok: true, detail: `Statut Stripe : ${sub.status}` }
    }

    return { ok: true, detail: "Aucune référence Stripe enregistrée" }
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "Erreur Stripe" }
  }
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
