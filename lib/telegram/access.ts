// Channel access lifecycle: Stripe status -> membership of the private channel.
//
// This is the single place that decides whether a user may be in the channel, so
// the Stripe webhook, the dashboard and the admin actions can never drift apart.
// Billing state is always re-read from the database here; nothing trusts a
// client-supplied flag (spec sections 3, 5 and 6).
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  approveChatJoinRequest,
  createInviteLink,
  declineChatJoinRequest,
  removeUserFromChannel,
  revokeInviteLink,
} from "./service"
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

/**
 * Ejects every user who is physically in the channel but no longer entitled.
 *
 * This is the enforcement step the SQL expiry sweep cannot perform:
 * `expire_lapsed_subscriptions` flips billing and access rows inside Postgres,
 * but Postgres cannot call Telegram, so a lapsed member stays physically in the
 * channel and keeps receiving broadcasts until something kicks them.
 *
 * It is deliberately driven by physical presence (`channel_status`), not by the
 * reason access ended: natural expiry, a failed payment, an explicit
 * cancellation and a non-renewal all leave a non-entitled account sitting in the
 * channel, and one pass handles them all — including cases the SQL sweep never
 * flips (e.g. `canceled`) or where a Stripe webhook was missed. Billing is
 * re-read live per user via `hasPremiumAccess`, never trusted from a cached flag.
 *
 * The removal is a temporary kick (ban + immediate unban in
 * `removeUserFromChannel`), so a later valid payment re-admits the same account
 * automatically with a fresh invite.
 */
export async function sweepChannelMembership(): Promise<{ checked: number; removed: number }> {
  const supabase = createAdminClient()
  if (!supabase) return { checked: 0, removed: 0 }

  // Only accounts with a real foothold in the channel: joined members and
  // pending invitees. Never-linked or already-removed users are skipped.
  const { data, error } = await supabase
    .from("telegram_settings")
    .select("user_id, telegram_user_id, channel_status")
    .not("telegram_user_id", "is", null)
    .in("channel_status", ["member", "invited"])

  if (error || !data) return { checked: 0, removed: 0 }

  let removed = 0
  for (const row of data) {
    const userId = String(row.user_id)
    if (await hasPremiumAccess(userId)) continue
    const result = await revokeChannelAccess(userId, "expiry_sweep")
    if (result.ok) removed += 1
  }

  logEvent("telegram_membership_swept", { checked: data.length, removed })
  return { checked: data.length, removed }
}

export type JoinDecision = "approved" | "declined" | "unknown_user" | "not_configured" | "error"

/**
 * Decides a pending channel join request (spec: paid access only).
 *
 * This is the real security gate of the join-request model. A `chat_join_request`
 * update carries a Telegram user id we do not implicitly trust: we resolve it to
 * a RedMatch account and RE-CHECK the live subscription before letting Telegram
 * add anyone. An unknown account, or one without an active subscription, is
 * declined — a leaked invite link is therefore worthless without a paid account
 * behind it.
 *
 * On approval the invite link is revoked immediately, which restores the
 * "one join per link" guarantee that `member_limit` used to provide before the
 * switch to join requests.
 */
export async function approveChannelJoin(telegramUserId: number): Promise<JoinDecision> {
  const supabase = createAdminClient()
  if (!supabase) return "error"

  const { data } = await supabase
    .from("telegram_settings")
    .select("user_id, invite_link")
    .eq("telegram_user_id", telegramUserId)
    .maybeSingle()

  // No linked RedMatch account for this Telegram user: refuse and clear it.
  if (!data?.user_id) {
    const declined = await declineChatJoinRequest(telegramUserId)
    logEvent("telegram_join_declined", { reason: "unknown_user" })
    return declined.ok ? "unknown_user" : "error"
  }

  const userId = String(data.user_id)

  // The authoritative check: billing is re-read from the database, never trusted
  // from the update itself.
  if (!(await hasPremiumAccess(userId))) {
    const declined = await declineChatJoinRequest(telegramUserId)
    logEvent("telegram_join_declined", { userId, reason: "no_subscription" })
    return declined.ok ? "declined" : "error"
  }

  const approved = await approveChatJoinRequest(telegramUserId)
  if (!approved.ok) {
    logEvent("telegram_invite_failed", { userId, reason: approved.reason })
    return approved.reason === "not_configured" ? "not_configured" : "error"
  }

  // Single-use: burn the link now that it has admitted its owner, and record the
  // membership so the dashboard reflects the joined state.
  if (data.invite_link) await revokeInviteLink(String(data.invite_link))
  await supabase
    .from("telegram_settings")
    .update({
      channel_status: "member",
      access_status: "active",
      invite_link: null,
      invite_link_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  logEvent("telegram_join_approved", { userId })
  return "approved"
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
