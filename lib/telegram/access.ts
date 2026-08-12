// Channel access lifecycle: Stripe status -> membership of the private channel.
//
// This is the single place that decides whether a user may be in the channel, so
// the Stripe webhook, the dashboard and the admin actions can never drift apart.
// Billing state is always re-read from the database here; nothing trusts a
// client-supplied flag (spec sections 3, 5 and 6).
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { createInviteLink, removeUserFromChannel, revokeInviteLink } from "./service"
import { logEvent } from "@/lib/logging"

/** Stripe statuses that entitle a user to premium access. */
const ACTIVE_STATUSES = new Set(["active", "trialing", "lifetime"])

/** True when this user's subscription currently entitles premium access. */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const supabase = createAdminClient()
  if (!supabase) return false

  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data || !ACTIVE_STATUSES.has(String(data.status))) return false

  // A period end in the past means the subscription lapsed without a webhook
  // (or before one arrived); treat it as inactive rather than trusting status.
  const end = data.current_period_end ? new Date(String(data.current_period_end)).getTime() : null
  if (end !== null && Number.isFinite(end) && end < Date.now()) return false

  return true
}

export type ChannelAccess = {
  connected: boolean
  telegramUserId: number | null
  inviteLink: string | null
  inviteExpiresAt: string | null
  channelStatus: string
}

/** Reads the user's Telegram linkage and channel state. */
export async function getChannelAccess(userId: string): Promise<ChannelAccess> {
  const supabase = createAdminClient()
  const empty: ChannelAccess = {
    connected: false,
    telegramUserId: null,
    inviteLink: null,
    inviteExpiresAt: null,
    channelStatus: "none",
  }
  if (!supabase) return empty

  const { data } = await supabase
    .from("telegram_settings")
    .select("telegram_user_id, invite_link, invite_link_expires_at, channel_status")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data) return empty

  return {
    connected: data.telegram_user_id != null,
    telegramUserId: data.telegram_user_id != null ? Number(data.telegram_user_id) : null,
    inviteLink: (data.invite_link as string | null) ?? null,
    inviteExpiresAt: (data.invite_link_expires_at as string | null) ?? null,
    channelStatus: String(data.channel_status ?? "none"),
  }
}

export type GrantResult =
  | { ok: true; inviteLink: string; expiresAt: string; reused: boolean }
  | { ok: false; reason: "no_subscription" | "not_connected" | "not_configured" | "telegram_error" }

/**
 * Issues (or reuses) a personal invite link for an entitled subscriber.
 *
 * Guarded twice on purpose: no active subscription and no linked Telegram
 * account both mean no link, so a caller cannot hand out channel access by
 * mistake. A still-valid link is reused rather than piling up dead invites.
 */
export async function grantChannelAccess(userId: string): Promise<GrantResult> {
  if (!(await hasPremiumAccess(userId))) return { ok: false, reason: "no_subscription" }

  const supabase = createAdminClient()
  if (!supabase) return { ok: false, reason: "telegram_error" }

  const access = await getChannelAccess(userId)
  if (!access.connected) return { ok: false, reason: "not_connected" }

  // Reuse a link that is still valid and unused.
  if (access.inviteLink && access.inviteExpiresAt && new Date(access.inviteExpiresAt).getTime() > Date.now()) {
    if (access.channelStatus !== "member") {
      return { ok: true, inviteLink: access.inviteLink, expiresAt: access.inviteExpiresAt, reused: true }
    }
  }

  const created = await createInviteLink(`RedMatch ${userId.slice(0, 8)}`)
  if (!created.ok) {
    logEvent("telegram_invite_failed", { userId, reason: created.reason })
    return { ok: false, reason: created.reason === "not_configured" ? "not_configured" : "telegram_error" }
  }

  await supabase
    .from("telegram_settings")
    .update({
      invite_link: created.inviteLink,
      invite_link_expires_at: created.expiresAt,
      channel_status: "invited",
      access_status: "active",
      revoked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  logEvent("telegram_invite_generated", { userId })
  return { ok: true, inviteLink: created.inviteLink, expiresAt: created.expiresAt, reused: false }
}

/**
 * Removes a user from the channel and kills their invite (spec section 6).
 *
 * The RedMatch account itself is untouched: only premium access is withdrawn, so
 * a later re-subscription can simply issue a fresh link.
 */
export async function revokeChannelAccess(userId: string, reason: string): Promise<{ ok: boolean }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false }

  const access = await getChannelAccess(userId)

  // Kill the invite first so a pending link cannot be redeemed after removal.
  if (access.inviteLink) await revokeInviteLink(access.inviteLink)
  if (access.telegramUserId) await removeUserFromChannel(access.telegramUserId)

  await supabase
    .from("telegram_settings")
    .update({
      invite_link: null,
      invite_link_expires_at: null,
      channel_status: "removed",
      access_status: "revoked",
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  logEvent("telegram_user_removed", { userId, reason })
  return { ok: true }
}

/** Marks the user as having actually joined, from a chat_member update. */
export async function markChannelJoined(telegramUserId: number): Promise<void> {
  const supabase = createAdminClient()
  if (!supabase) return

  await supabase
    .from("telegram_settings")
    .update({ channel_status: "member", invite_link: null, invite_link_expires_at: null, updated_at: new Date().toISOString() })
    .eq("telegram_user_id", telegramUserId)
}
