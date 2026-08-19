// Server-side authorization for alert delivery (spec sections 10, 11 and 13).
//
// Two rules drive this module:
//
//   1. Authorization is decided on the server, from the database. The frontend
//      never gets a say — it may only display an already-computed verdict.
//   2. A registered Telegram chat is NOT authorization. Billing state is checked
//      independently, so a user whose subscription lapsed stops receiving alerts
//      even though their chat id is still on file.
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

/** Subscription statuses that grant access. */
const ENTITLED_STATUSES = new Set(["active", "trialing"])

export type DenialReason =
  | "no_subscription"
  | "subscription_inactive"
  | "subscription_expired"
  | "telegram_not_linked"
  | "telegram_revoked"
  | "storage_unavailable"

export type Authorization =
  | {
      allowed: true
      chatId: string
      plan: string
    }
  | { allowed: false; reason: DenialReason; detail?: string }

/**
 * Decides whether one user may receive a Telegram alert right now.
 *
 * Every condition the spec lists is checked on each call — active subscription,
 * valid expiry, authorized Telegram access — because this runs immediately before
 * a send and must reflect the current state, not a cached earlier decision.
 */
export async function authorizeTelegramDelivery(userId: string): Promise<Authorization> {
  const supabase = createAdminClient()
  if (!supabase) {
    return { allowed: false, reason: "storage_unavailable", detail: "Service role key is not configured." }
  }

  const [subscription, telegram] = await Promise.all([
    supabase.from("subscriptions").select("plan,status,current_period_end").eq("user_id", userId).maybeSingle(),
    supabase.from("telegram_settings").select("chat_id,access_status").eq("user_id", userId).maybeSingle(),
  ])

  if (subscription.error) {
    return { allowed: false, reason: "storage_unavailable", detail: subscription.error.message }
  }
  if (!subscription.data) {
    return { allowed: false, reason: "no_subscription" }
  }

  const { plan, status, current_period_end } = subscription.data as {
    plan: string
    status: string
    current_period_end: string | null
  }

  if (!ENTITLED_STATUSES.has(status)) {
    return { allowed: false, reason: "subscription_inactive", detail: status }
  }

  // A null period end means the plan does not expire (the lifetime "Offre
  // Fondateur"). Any concrete date in the past denies delivery, even if the
  // status row has not yet been swept to 'expired' — the date is authoritative,
  // so a delayed sweep can never grant extra access.
  if (current_period_end !== null && new Date(current_period_end).getTime() <= Date.now()) {
    return { allowed: false, reason: "subscription_expired", detail: current_period_end }
  }

  if (telegram.error) {
    return { allowed: false, reason: "storage_unavailable", detail: telegram.error.message }
  }

  const chatId = (telegram.data?.chat_id as string | undefined)?.trim()
  if (!telegram.data || !chatId) {
    return { allowed: false, reason: "telegram_not_linked" }
  }
  if ((telegram.data.access_status as string) !== "active") {
    return { allowed: false, reason: "telegram_revoked", detail: telegram.data.access_status as string }
  }

  return { allowed: true, chatId, plan }
}

/**
 * Every user currently entitled to alerts for a given competition.
 *
 * Used to fan a detected expulsion out to subscribers. Each candidate still goes
 * through `authorizeTelegramDelivery` before a send: this query narrows the set,
 * it does not grant permission.
 */
export async function findEligibleRecipients(competitionSlug: string): Promise<string[]> {
  const supabase = createAdminClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("user_competitions")
    .select("user_id")
    .eq("competition_id", competitionSlug)
    .eq("enabled", true)

  if (error || !data) return []
  return data.map((row) => row.user_id as string)
}

/**
 * Runs the expiry sweep (spec section 13): lapsed subscriptions become
 * 'expired' and their Telegram access is revoked in the same transaction, so
 * authorization can never drift from billing state.
 *
 * The work lives in the `expire_lapsed_subscriptions` SQL function rather than
 * here, because doing it in two round-trips from the app would leave a window
 * where a subscription is expired but access is still active.
 */
export async function runExpirySweep(): Promise<{
  ok: boolean
  expiredTotal?: number
  channelChecked?: number
  channelRemoved?: number
  error?: string
}> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "Service role key is not configured." }

  // 1. Flip billing/access rows first. Postgres cannot call Telegram, so this
  //    only updates state — it never ejects anyone from the channel.
  const { data, error } = await supabase.rpc("expire_lapsed_subscriptions")
  if (error) return { ok: false, error: error.message }

  // 2. Then enforce that state on Telegram: kick every member who is no longer
  //    entitled, whatever the reason (expiry, failed payment, cancellation,
  //    non-renewal). Dynamic import avoids a static cycle with lib/telegram.
  //    A Telegram failure must not fail the billing sweep, so it is contained.
  let channelChecked: number | undefined
  let channelRemoved: number | undefined
  try {
    const { sweepChannelMembership } = await import("@/lib/telegram/access")
    const swept = await sweepChannelMembership()
    channelChecked = swept.checked
    channelRemoved = swept.removed
  } catch {
    // Swallow: the DB is already consistent and the next sweep retries the kick.
  }

  return {
    ok: true,
    expiredTotal: typeof data === "number" ? data : undefined,
    channelChecked,
    channelRemoved,
  }
}

/** Manual revocation, e.g. from a future Stripe cancellation webhook. */
export async function revokeTelegramAccess(userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "Service role key is not configured." }

  const { error } = await supabase
    .from("telegram_settings")
    .update({ access_status: "revoked", revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId)

  return error ? { ok: false, error: error.message } : { ok: true }
}

/** Grants access after a confirmed payment, e.g. from a Stripe webhook. */
export async function grantTelegramAccess(userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "Service role key is not configured." }

  const { error } = await supabase
    .from("telegram_settings")
    .update({ access_status: "active", revoked_at: null, updated_at: new Date().toISOString() })
    .eq("user_id", userId)

  return error ? { ok: false, error: error.message } : { ok: true }
}
