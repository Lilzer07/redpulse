// Telegram webhook (spec sections 1 and 12).
//
// Telegram POSTs every message for the bot here. Authenticity rests on two
// layers, neither of which needs manual configuration:
//
//   1. Secret URL. The `[secret]` segment is derived from TELEGRAM_BOT_TOKEN and
//      is only ever disclosed to Telegram via setWebhook. A wrong or missing
//      segment is rejected with 404 — a stranger cannot POST fake /start or
//      /stop commands without guessing 160 bits, and 404 (rather than 401) does
//      not even confirm that a webhook lives at this prefix.
//   2. Optional header secret. If TELEGRAM_WEBHOOK_SECRET is configured, the
//      echoed X-Telegram-Bot-Api-Secret-Token header must match as well.
//
// Beyond the chat it must reply to, the handler trusts nothing from the message
// body: every account change goes through the linking helpers, which hash tokens
// and re-check live billing state.
import { NextResponse } from "next/server"
import { sendTelegramMessage } from "@/lib/telegram/send"
import { redeemLinkToken, unlinkTelegram, findUserByChatId } from "@/lib/telegram/linking"
import { authorizeTelegramDelivery } from "@/lib/subscriptions/authorization"
import { safeEqual, webhookPathSecret } from "@/lib/telegram/webhook"

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

/** Indistinguishable from a non-existent route, so the prefix leaks nothing. */
const notFound = () => NextResponse.json({ ok: false }, { status: 404 })

export async function POST(request: Request, { params }: { params: Promise<{ secret: string }> }) {
  const expectedPath = webhookPathSecret()
  if (!expectedPath) return notFound()

  const { secret } = await params
  if (!safeEqual(secret ?? "", expectedPath)) return notFound()

  // Layered check: only enforced when a header secret is actually configured.
  const headerSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
  if (headerSecret && !safeEqual(request.headers.get("x-telegram-bot-api-secret-token") ?? "", headerSecret)) {
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
    const token = text.split(/\s+/)[1]

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
