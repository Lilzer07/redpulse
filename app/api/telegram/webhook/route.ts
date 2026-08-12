// Telegram webhook (spec sections 1 and 12).
//
// Telegram POSTs every message for the bot here. Two things make this safe:
//
//   1. Secret verification. When the webhook is registered we set a secret; on
//      every call Telegram echoes it in the X-Telegram-Bot-Api-Secret-Token
//      header. A request without the exact secret is rejected with 401 before
//      any work — this is what stops a stranger from POSTing fake /start or
//      /stop commands to drive account linking.
//   2. All account changes go through the server-side linking helpers, which
//      hash tokens and check billing state; the webhook itself trusts nothing
//      from the message body beyond the chat it must reply to.
import { NextResponse } from "next/server"
import { sendTelegramMessage } from "@/lib/telegram/send"
import { redeemLinkToken, unlinkTelegram, findUserByChatId } from "@/lib/telegram/linking"
import { authorizeTelegramDelivery } from "@/lib/subscriptions/authorization"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Minimal shape of the Telegram update fields we use. */
type TelegramUpdate = {
  message?: {
    text?: string
    chat?: { id?: number }
    from?: { id?: number; username?: string }
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

  // Refuse by default: with no secret configured the endpoint cannot be trusted,
  // so it declines rather than processing anonymous commands.
  if (!expected) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 })
  }

  const provided = request.headers.get("x-telegram-bot-api-secret-token") ?? ""
  if (!timingSafeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = (await request.json()) as TelegramUpdate
  } catch {
    // Malformed body: acknowledge with 200 so Telegram does not retry forever.
    return NextResponse.json({ ok: true })
  }

  const chatId = update.message?.chat?.id
  const text = update.message?.text?.trim()
  if (typeof chatId !== "number" || !text) {
    return NextResponse.json({ ok: true })
  }

  const chat = String(chatId)
  const reply = (message: string) => sendTelegramMessage(chat, message)

  // ---- /start <token> : redeem a linking token ----------------------------
  if (text.startsWith("/start")) {
    const parts = text.split(/\s+/)
    const token = parts[1]

    if (!token) {
      await reply(
        "Bienvenue sur RedMatch. Pour connecter ce chat, ouvrez le lien de connexion depuis votre tableau de bord RedMatch.",
      )
      return NextResponse.json({ ok: true })
    }

    const result = await redeemLinkToken(
      token,
      chat,
      update.message?.from?.id ?? chatId,
      update.message?.from?.username ?? null,
    )

    if (!result.ok) {
      await reply(
        result.error === "invalid_or_expired"
          ? "Ce lien de connexion est invalide ou expiré. Générez-en un nouveau depuis votre tableau de bord."
          : "Service momentanément indisponible. Réessayez dans un instant.",
      )
      return NextResponse.json({ ok: true })
    }

    await reply(
      result.accessStatus === "active"
        ? "Chat connecté. Vous recevrez ici vos alertes carton rouge en temps réel."
        : "Chat connecté. Vos alertes démarreront dès que votre abonnement sera actif.",
    )
    return NextResponse.json({ ok: true })
  }

  // ---- /status : report the live authorization verdict ---------------------
  if (text.startsWith("/status")) {
    const linked = await findUserByChatId(chat)
    if (!linked) {
      await reply("Ce chat n'est connecté à aucun compte RedMatch.")
      return NextResponse.json({ ok: true })
    }

    const auth = await authorizeTelegramDelivery(linked.userId)
    await reply(
      auth.allowed
        ? "Statut : actif. Vous recevez les alertes carton rouge."
        : "Statut : inactif. Vos alertes sont en pause (abonnement ou accès non actif).",
    )
    return NextResponse.json({ ok: true })
  }

  // ---- /stop : disconnect this chat ----------------------------------------
  if (text.startsWith("/stop")) {
    await unlinkTelegram({ chatId: chat })
    await reply("Chat déconnecté. Vous ne recevrez plus d'alertes. Reconnectez-le depuis votre tableau de bord.")
    return NextResponse.json({ ok: true })
  }

  // Unknown command: keep quiet but acknowledge, so Telegram stops retrying.
  return NextResponse.json({ ok: true })
}
