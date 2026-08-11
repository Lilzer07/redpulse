// Telegram delivery (spec sections 9 and 11).
//
// The transport is real: when TELEGRAM_BOT_TOKEN is present this calls the Bot
// API for real. When it is absent, `sendTelegramMessage` returns
// `status: "not_configured"` and sends nothing — it never reports a fake success.
// That is the spec's requirement ("NE PAS créer de faux envoi Telegram"): the
// architecture is ready, but nothing pretends to have happened.
import "server-only"

import { authorizeTelegramDelivery } from "@/lib/subscriptions/authorization"
import type { RedCardAnalysis, RedCardEvent } from "@/lib/football/types"
import { formatTelegramAlert } from "./format"

const TELEGRAM_API = "https://api.telegram.org"
const SEND_TIMEOUT_MS = 8_000

export type SendResult =
  | { status: "sent"; messageId: number }
  | { status: "not_configured" }
  | { status: "failed"; error: string }

/** True when the bot token is available. Never exposes the token itself. */
export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN
  return typeof token === "string" && token.trim().length > 0
}

/**
 * Sends one plain-text message to a chat.
 *
 * No `parse_mode`: the message embeds third-party team and player names, and
 * plain text makes them incapable of breaking the markup or injecting into it.
 */
export async function sendTelegramMessage(chatId: string, text: string): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!token) return { status: "not_configured" }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: controller.signal,
      cache: "no-store",
    })

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; description?: string; result?: { message_id?: number } }
      | null

    if (!response.ok || !payload?.ok) {
      // Telegram echoes the request URL in some errors; report only its own
      // description so the token can never reach a log.
      return { status: "failed", error: payload?.description ?? `Telegram returned HTTP ${response.status}` }
    }

    return { status: "sent", messageId: payload.result?.message_id ?? 0 }
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError"
    return { status: "failed", error: aborted ? "Telegram request timed out." : "Telegram request failed." }
  } finally {
    clearTimeout(timer)
  }
}

export type DeliveryOutcome =
  | { userId: string; delivered: true; messageId: number }
  | { userId: string; delivered: false; reason: string }

/**
 * Delivers a red-card alert to one user, gated on authorization.
 *
 * The authorization check happens here, immediately before the send, rather than
 * being trusted from the caller. This is the single choke point the spec asks
 * for: an expired or revoked user cannot be alerted even by a buggy caller.
 */
export async function deliverRedCardAlert(
  userId: string,
  event: RedCardEvent,
  analysis: RedCardAnalysis,
): Promise<DeliveryOutcome> {
  const authorization = await authorizeTelegramDelivery(userId)
  if (!authorization.allowed) {
    return { userId, delivered: false, reason: authorization.reason }
  }

  const result = await sendTelegramMessage(authorization.chatId, formatTelegramAlert(event, analysis))
  if (result.status === "sent") return { userId, delivered: true, messageId: result.messageId }
  return { userId, delivered: false, reason: result.status === "not_configured" ? "telegram_not_configured" : result.error }
}
