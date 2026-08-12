// Server-side Telegram service (spec section 8).
//
// Everything that talks to the Telegram Bot API goes through here, so the bot
// token exists in exactly one place: process.env, on the server. It is never
// returned, never logged, and never reaches the browser bundle.
//
// The channel is addressed by TELEGRAM_CHAT_ID. The public join link from the
// spec is deliberately NOT used as the access path: each subscriber gets their
// own single-use invite link so membership can be traced and revoked per user.
import "server-only"

import { getConfigValue, setConfigValue } from "@/lib/config-store"

const TELEGRAM_API = "https://api.telegram.org"

/**
 * Per-member invite links stay valid for this long.
 *
 * Kept short on purpose: the link only has to survive the few seconds between
 * "get my link" and tapping it in Telegram. A tight window shrinks the chance
 * of a link leaking and being used by someone else before the join request is
 * checked against the subscription.
 */
const INVITE_TTL_MS = 15 * 60 * 1000

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null
}

/** Where an auto-discovered channel id is persisted. */
const CHANNEL_CONFIG_KEY = "telegram_chat_id"

/**
 * Resolves the target channel.
 *
 * TELEGRAM_CHAT_ID wins when set, so an operator can always pin the channel
 * explicitly. Otherwise the id learned when the bot was promoted in a channel is
 * used (see `rememberChannelId`), which spares the user from copying a numeric id
 * by hand — the bot cannot create or join a channel on its own, but it can
 * recognise the moment it is added to one.
 */
async function channelId(): Promise<string | null> {
  const fromEnv = process.env.TELEGRAM_CHAT_ID?.trim()
  if (fromEnv) return fromEnv
  return await getConfigValue(CHANNEL_CONFIG_KEY)
}

/** Persists a channel id discovered from a Telegram update. */
export async function rememberChannelId(chatId: string | number): Promise<boolean> {
  return await setConfigValue(CHANNEL_CONFIG_KEY, String(chatId))
}

/** True when both the bot token and the target channel are known. */
export async function isTelegramConfigured(): Promise<boolean> {
  return Boolean(botToken() && (await channelId()))
}

export type TelegramFailure =
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "api_error"; detail: string }

/**
 * Single entry point to the Bot API.
 *
 * Callers get a discriminated result instead of a thrown error: a Telegram
 * outage must never take the site down (spec section 11). Error text from
 * Telegram is passed through, but the token never appears in it because it only
 * ever travels in the URL path we build here.
 */
async function call<T>(method: string, body?: Record<string, unknown>): Promise<({ ok: true; result: T }) | TelegramFailure> {
  const token = botToken()
  if (!token) return { ok: false, reason: "not_configured" }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    })

    const payload = (await res.json().catch(() => null)) as
      | { ok?: boolean; result?: T; description?: string }
      | null

    if (!res.ok || !payload?.ok) {
      return { ok: false, reason: "api_error", detail: payload?.description ?? `HTTP ${res.status}` }
    }
    return { ok: true, result: payload.result as T }
  } catch (error) {
    return { ok: false, reason: "api_error", detail: error instanceof Error ? error.message : "network error" }
  }
}

/** Resolves the bot's @username (used to build /start deep links). */
export async function getBotUsername(): Promise<string | null> {
  const result = await call<{ username?: string }>("getMe")
  return result.ok ? (result.result.username ?? null) : null
}

/**
 * Sends a plain-text message to any chat id (a member DM, or the channel).
 *
 * No `parse_mode`, deliberately: alert bodies embed third-party team and player
 * names, and a name containing `<` or `&` would either break the markup or make
 * Telegram reject the whole message. Plain text removes any need to escape them,
 * and no message we send needs rich formatting.
 */
export async function sendMessage(chatId: string, text: string): Promise<{ ok: true } | TelegramFailure> {
  const result = await call<unknown>("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  })
  return result.ok ? { ok: true } : result
}

/**
 * Publishes an alert into the private channel.
 *
 * Plain text on purpose: alert bodies carry names straight from API-Football.
 */
export async function sendChannelMessage(text: string): Promise<{ ok: true } | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }
  return sendMessage(channel, text)
}

export type InviteLink = { inviteLink: string; expiresAt: string }

/**
 * Creates a personal invite link that funnels the user into a JOIN REQUEST
 * rather than an instant join.
 *
 * `creates_join_request: true` is the crux of the access model: tapping the link
 * does not add anyone to the channel — it raises a `chat_join_request` update
 * that the bot approves only after re-checking the subscription server-side
 * (see `approveChannelJoin`). This closes the hole where a leaked instant-join
 * link would hand out channel access with no payment check at join time.
 *
 * Telegram forbids `member_limit` together with `creates_join_request`, so the
 * "one person only" guarantee moves to the approval handler: it approves a
 * single request, then revokes the link so it can raise no further requests.
 * `expire_date` still caps how long an unused link can sit around.
 */
export async function createInviteLink(label: string): Promise<({ ok: true } & InviteLink) | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const expiresAt = new Date(Date.now() + INVITE_TTL_MS)
  const result = await call<{ invite_link?: string }>("createChatInviteLink", {
    chat_id: channel,
    name: label.slice(0, 32),
    expire_date: Math.floor(expiresAt.getTime() / 1000),
    creates_join_request: true,
  })

  if (!result.ok) return result
  if (!result.result.invite_link) return { ok: false, reason: "api_error", detail: "missing invite_link" }
  return { ok: true, inviteLink: result.result.invite_link, expiresAt: expiresAt.toISOString() }
}

/**
 * Approves a pending join request for a user (spec: paid access only).
 *
 * Called from the webhook once the subscription has been confirmed active. The
 * user is added to the channel by Telegram as a direct result of this call.
 */
export async function approveChatJoinRequest(telegramUserId: number): Promise<{ ok: true } | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const result = await call<unknown>("approveChatJoinRequest", { chat_id: channel, user_id: telegramUserId })
  return result.ok ? { ok: true } : result
}

/**
 * Declines a pending join request — used when no active subscription backs it.
 *
 * Declining (rather than ignoring) clears the request so a later, legitimate
 * attempt starts from a clean slate.
 */
export async function declineChatJoinRequest(telegramUserId: number): Promise<{ ok: true } | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const result = await call<unknown>("declineChatJoinRequest", { chat_id: channel, user_id: telegramUserId })
  return result.ok ? { ok: true } : result
}

/** Revokes a previously issued invite link so it can no longer be used. */
export async function revokeInviteLink(inviteLink: string): Promise<{ ok: true } | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const result = await call<unknown>("revokeChatInviteLink", { chat_id: channel, invite_link: inviteLink })
  return result.ok ? { ok: true } : result
}

/**
 * Removes a user from the channel when their access ends (spec section 6).
 *
 * Telegram has no plain "kick": banning then immediately unbanning ejects the
 * member while leaving them free to re-join later with a fresh invite, which is
 * exactly what a re-subscription needs.
 */
export async function removeUserFromChannel(telegramUserId: number): Promise<{ ok: true } | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const banned = await call<unknown>("banChatMember", {
    chat_id: channel,
    user_id: telegramUserId,
    revoke_messages: false,
  })
  if (!banned.ok) return banned

  // Lift the ban so a future subscription can re-admit the same account.
  await call<unknown>("unbanChatMember", { chat_id: channel, user_id: telegramUserId, only_if_banned: true })
  return { ok: true }
}

export type MemberStatus = "creator" | "administrator" | "member" | "restricted" | "left" | "kicked"

/** Reads a user's real membership status in the channel. */
export async function getChatMember(
  telegramUserId: number,
): Promise<({ ok: true; status: MemberStatus }) | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const result = await call<{ status?: MemberStatus }>("getChatMember", {
    chat_id: channel,
    user_id: telegramUserId,
  })
  if (!result.ok) return result
  return { ok: true, status: (result.result.status ?? "left") as MemberStatus }
}

/** Reads the channel title, used by the admin "Tester Telegram" action. */
export async function getChannelInfo(): Promise<({ ok: true; title: string }) | TelegramFailure> {
  const channel = await channelId()
  if (!channel) return { ok: false, reason: "not_configured" }

  const result = await call<{ title?: string }>("getChat", { chat_id: channel })
  if (!result.ok) return result
  return { ok: true, title: result.result.title ?? "(sans titre)" }
}
