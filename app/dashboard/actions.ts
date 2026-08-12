"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { competitions } from "@/lib/data"
import { createLinkToken, unlinkTelegram } from "@/lib/telegram/linking"
import { grantChannelAccess } from "@/lib/telegram/access"
import { authorizeTelegramDelivery } from "@/lib/subscriptions/authorization"
import { sendMessage } from "@/lib/telegram/service"

/**
 * Every action re-reads the session server-side and writes with that user's id.
 * The client never supplies the owner, so it cannot write to another account —
 * and RLS rejects it a second time at the database level.
 */
async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("not-authenticated")
  return { supabase, user }
}

type ActionResult = { ok: true } | { ok: false; error: string }

export async function setCompetitionEnabled(competitionId: string, enabled: boolean): Promise<ActionResult> {
  // Reject ids that are not part of the known catalogue.
  if (!competitions.some((c) => c.id === competitionId)) {
    return { ok: false, error: "unknown-competition" }
  }

  try {
    const { supabase, user } = await requireUser()
    const { error } = await supabase
      .from("user_competitions")
      .upsert(
        { user_id: user.id, competition_id: competitionId, enabled, updated_at: new Date().toISOString() },
        { onConflict: "user_id,competition_id" },
      )
    if (error) return { ok: false, error: error.message }

    revalidatePath("/dashboard/competitions")
    revalidatePath("/dashboard")
    return { ok: true }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

export async function setAllCompetitions(enabled: boolean): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser()
    const now = new Date().toISOString()
    const rows = competitions.map((c) => ({
      user_id: user.id,
      competition_id: c.id,
      enabled,
      updated_at: now,
    }))

    const { error } = await supabase.from("user_competitions").upsert(rows, { onConflict: "user_id,competition_id" })
    if (error) return { ok: false, error: error.message }

    revalidatePath("/dashboard/competitions")
    revalidatePath("/dashboard")
    return { ok: true }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

/**
 * Starts Telegram linking: mints a one-time deep link the user opens to connect
 * their chat to the single shared bot. No bot token is ever handled here or in
 * the browser — the server owns it (spec section 1).
 */
export async function startTelegramLinking(): Promise<
  { ok: true; deepLink: string; expiresAt: string } | { ok: false; error: string }
> {
  try {
    const { user } = await requireUser()
    const result = await createLinkToken(user.id)
    if (!result.ok) return { ok: false, error: result.error }

    revalidatePath("/dashboard/telegram")
    return { ok: true, deepLink: result.deepLink, expiresAt: result.expiresAt }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

/**
 * Issues (or reuses) this user's personal invite link to the private channel.
 *
 * Needed because joining is a manual step in Telegram: the link is normally sent
 * by the bot on `/start`, but a user who lost that message would otherwise be
 * stuck — linked, paying, and receiving nothing. `grantChannelAccess` re-checks
 * both the subscription and the linkage server-side, so this cannot hand out
 * access to an unentitled account.
 */
export async function requestChannelInvite(): Promise<
  { ok: true; inviteLink: string } | { ok: false; error: string }
> {
  try {
    const { user } = await requireUser()
    const result = await grantChannelAccess(user.id)
    if (!result.ok) return { ok: false, error: result.reason }

    revalidatePath("/dashboard/telegram")
    return { ok: true, inviteLink: result.inviteLink }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

/** Disconnects the user's Telegram chat and revokes delivery immediately. */
export async function disconnectTelegram(): Promise<ActionResult> {
  try {
    const { user } = await requireUser()
    const { ok } = await unlinkTelegram({ userId: user.id })
    if (!ok) return { ok: false, error: "storage-unavailable" }

    revalidatePath("/dashboard/telegram")
    revalidatePath("/dashboard")
    return { ok: true }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

/**
 * Sends a real test message to the user's linked chat, gated by the same
 * authorization used for real alerts. Never fakes success: an unconfigured bot
 * or an unauthorized user is reported honestly.
 */
export async function sendTestAlert(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { user } = await requireUser()

    const auth = await authorizeTelegramDelivery(user.id)
    if (!auth.allowed) return { ok: false, error: auth.reason }

    const result = await sendMessage(
      auth.chatId,
      "RedMatch — message de test. Votre connexion Telegram fonctionne : les alertes carton rouge arriveront ici.",
    )
    if (result.ok) return { ok: true }
    return { ok: false, error: result.reason === "not_configured" ? "telegram_not_configured" : result.detail }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

export async function updateProfile(input: {
  displayName?: string
  timezone?: string
  notifyInstant?: boolean
  notifyDigest?: boolean
  notifyProduct?: boolean
}): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser()

    // Only forward the fields actually provided.
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.displayName !== undefined) patch.display_name = input.displayName.trim().slice(0, 80) || null
    if (input.timezone !== undefined) patch.timezone = input.timezone
    if (input.notifyInstant !== undefined) patch.notify_instant = input.notifyInstant
    if (input.notifyDigest !== undefined) patch.notify_digest = input.notifyDigest
    if (input.notifyProduct !== undefined) patch.notify_product = input.notifyProduct

    // Upsert rather than update: accounts created before the signup trigger
    // existed have no profile row, and a plain update would silently match none.
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...patch }, { onConflict: "id" })
    if (error) return { ok: false, error: error.message }

    // The profile feeds the dashboard layout (sidebar, greeting), so revalidate
    // the whole subtree rather than just this page.
    revalidatePath("/dashboard", "layout")
    return { ok: true }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}

/** Changes the password of the signed-in user via Supabase Auth. */
export async function changePassword(newPassword: string): Promise<ActionResult> {
  if (newPassword.length < 8) return { ok: false, error: "weak-password" }

  try {
    const { supabase } = await requireUser()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch {
    return { ok: false, error: "not-authenticated" }
  }
}
