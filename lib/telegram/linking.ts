// Telegram account linking via a single shared bot (spec section 1).
//
// Flow, with the bot token living ONLY on the server:
//   1. The dashboard calls `createLinkToken(userId)`. We mint a random one-time
//      token, store only its SHA-256 hash (never the plaintext) with a short
//      expiry, and hand back a t.me deep link containing the plaintext.
//   2. The user opens the link; Telegram sends `/start <token>` to our webhook.
//   3. The webhook calls `redeemLinkToken`, which hashes the incoming token and
//      atomically matches it against the stored hash (see redeem_telegram_link).
//
// The plaintext token therefore exists only in the deep link and in the user's
// Telegram message — never at rest in our database, and never in the browser
// bundle alongside the bot token.
import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { getBotUsername } from "./service"

/** One-time linking tokens are valid for this long. Short by design. */
const LINK_TTL_MS = 15 * 60 * 1000

/** SHA-256, hex. Matches the digest computed in SQL for redemption. */
function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex")
}

export type LinkTokenResult =
  | { ok: true; deepLink: string; expiresAt: string }
  | { ok: false; error: "not_configured" | "storage_unavailable" | "bot_unreachable" }

/**
 * Mints a one-time linking token for a user and returns the deep link to open.
 * Stores only the hash, so a database leak cannot be replayed into a link.
 */
export async function createLinkToken(userId: string): Promise<LinkTokenResult> {
  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) return { ok: false, error: "not_configured" }

  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "storage_unavailable" }

  const username = await getBotUsername()
  if (!username) return { ok: false, error: "bot_unreachable" }

  // URL-safe token. 32 bytes of entropy is far beyond guessable within the TTL.
  const plain = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString()

  const { error } = await supabase.from("telegram_settings").upsert(
    {
      user_id: userId,
      link_token_hash: hashToken(plain),
      link_token_expires_at: expiresAt,
      // Opening a fresh link resets any prior verification; access is re-decided
      // at redemption time from live billing state.
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )
  if (error) return { ok: false, error: "storage_unavailable" }

  return { ok: true, deepLink: `https://t.me/${username}?start=${plain}`, expiresAt }
}

export type RedeemResult =
  | { ok: true; userId: string; accessStatus: "active" | "pending" }
  | { ok: false; error: "invalid_or_expired" | "storage_unavailable" }

/**
 * Redeems a linking token received through the webhook. The plaintext is hashed
 * here and matched atomically in SQL, so a token can be consumed exactly once.
 */
export async function redeemLinkToken(
  plainToken: string,
  chatId: string,
  telegramUserId: number,
  telegramUsername: string | null,
): Promise<RedeemResult> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "storage_unavailable" }

  const { data, error } = await supabase.rpc("redeem_telegram_link", {
    p_token_hash: hashToken(plainToken),
    p_chat_id: chatId,
    p_telegram_user_id: telegramUserId,
    p_telegram_username: telegramUsername,
  })

  if (error) return { ok: false, error: "storage_unavailable" }

  const row = Array.isArray(data) ? data[0] : data
  if (!row?.user_id) return { ok: false, error: "invalid_or_expired" }

  return { ok: true, userId: row.user_id as string, accessStatus: row.access_status as "active" | "pending" }
}

/**
 * Disconnects a chat: clears the destination and identity and revokes access, so
 * the monitor immediately stops delivering. Keyed by chat id (from a /stop
 * command) or user id (from the dashboard).
 */
export async function unlinkTelegram(by: { userId: string } | { chatId: string }): Promise<{ ok: boolean }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false }

  const patch = {
    chat_id: null,
    telegram_user_id: null,
    telegram_username: null,
    verified_at: null,
    access_status: "revoked",
    revoked_at: new Date().toISOString(),
    link_token_hash: null,
    link_token_expires_at: null,
    // Disconnecting must also kill channel entitlement, otherwise a stale invite
    // would keep working after the user asked to stop.
    invite_link: null,
    invite_link_expires_at: null,
    channel_status: "removed",
    updated_at: new Date().toISOString(),
  }

  const query = supabase.from("telegram_settings").update(patch)
  const { error } = "userId" in by ? await query.eq("user_id", by.userId) : await query.eq("chat_id", by.chatId)
  return { ok: !error }
}

/** Looks up a linked user by their Telegram chat id, for /status and /stop. */
export async function findUserByChatId(
  chatId: string,
): Promise<{ userId: string; accessStatus: string } | null> {
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("telegram_settings")
    .select("user_id, access_status")
    .eq("chat_id", chatId)
    .maybeSingle()

  if (error || !data?.user_id) return null
  return { userId: data.user_id as string, accessStatus: data.access_status as string }
}
