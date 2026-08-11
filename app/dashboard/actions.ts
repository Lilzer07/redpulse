"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { competitions } from "@/lib/data"

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
 * Saves the Telegram credentials and validates them against the real Telegram
 * API. verified_at is only set when Telegram itself confirms the bot and chat,
 * so a green state can never come from a simulated timeout.
 */
export async function saveTelegramSettings(
  botToken: string,
  chatId: string,
): Promise<{ ok: true; verified: boolean } | { ok: false; error: string }> {
  const token = botToken.trim()
  const chat = chatId.trim()
  if (!token || !chat) return { ok: false, error: "missing-fields" }

  try {
    const { supabase, user } = await requireUser()

    let verified = false
    try {
      // getMe validates the token; getChat validates the destination.
      const me = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`, {
        cache: "no-store",
      })
      if (me.ok) {
        const chatRes = await fetch(
          `https://api.telegram.org/bot${encodeURIComponent(token)}/getChat?chat_id=${encodeURIComponent(chat)}`,
          { cache: "no-store" },
        )
        verified = chatRes.ok
      }
    } catch {
      verified = false
    }

    const { error } = await supabase.from("telegram_settings").upsert(
      {
        user_id: user.id,
        bot_token: token,
        chat_id: chat,
        verified_at: verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    if (error) return { ok: false, error: error.message }

    revalidatePath("/dashboard/telegram")
    revalidatePath("/dashboard")
    return { ok: true, verified }
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

    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id)
    if (error) return { ok: false, error: error.message }

    revalidatePath("/dashboard/settings")
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
