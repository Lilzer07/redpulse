// Telegram webhook (spec sections 2, 5 and 9).
//
// Security model, deliberately minimal:
//   - TELEGRAM_WEBHOOK_SECRET is OPTIONAL. When set, Telegram echoes it in the
//     X-Telegram-Bot-Api-Secret-Token header and a mismatch is rejected. When
//     unset, the endpoint still works — the old "no secret => 503" behaviour is
//     gone, because it broke the whole flow for no gain.
//   - Nothing in the message body is trusted for identity. Linking only happens
//     by redeeming a one-time token whose hash we stored ourselves, and the
//     numeric Telegram user id (never the username) is what gets persisted.
import { NextResponse } from "next/server"
import { rememberChannelId, sendMessage } from "@/lib/telegram/service"
import { redeemLinkToken, unlinkTelegram, findUserByChatId } from "@/lib/telegram/linking"
import {
  approveChannelJoin,
  grantChannelAccess,
  hasPremiumAccess,
  markChannelJoined,
  revokeChannelAccess,
} from "@/lib/telegram/access"
import { logEvent } from "@/lib/logging"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TelegramUpdate = {
  message?: {
    text?: string
    chat?: { id?: number }
    from?: { id?: number; username?: string }
  }
  chat_member?: {
    new_chat_member?: { status?: string; user?: { id?: number } }
  }
  /** A user tapped a join-request invite link and awaits approval. */
  chat_join_request?: {
    chat?: { id?: number }
    from?: { id?: number }
  }
  /** The bot's OWN membership changing — how we learn the channel id. */
  my_chat_member?: {
    chat?: { id?: number; type?: string; title?: string }
    new_chat_member?: { status?: string }
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Always 200: Telegram retries anything else, and we have nothing to retry. */
const ack = () => NextResponse.json({ ok: true })

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

  // Optional hardening: only enforced when a secret is actually configured.
  if (expected) {
    const provided = request.headers.get("x-telegram-bot-api-secret-token") ?? ""
    if (!timingSafeEqual(provided, expected)) {
      // NOTE: this is a Telegram rejection, nothing to do with Stripe. The event
      // was previously mislabelled "stripe_webhook_rejected", which made the logs
      // look like Stripe auth was gating this route — it never was. A 401 here
      // means the secret_token Telegram sends (set when the webhook was
      // registered) no longer matches TELEGRAM_WEBHOOK_SECRET, so re-register the
      // webhook (POST /api/telegram/setup) to sync the two.
      logEvent("telegram_webhook_rejected", { reason: "bad_secret" })
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }
  }

  let update: TelegramUpdate
  try {
    update = (await request.json()) as TelegramUpdate
  } catch {
    return ack()
  }

  // ---- the bot itself was added to a channel: learn the channel id ---------
  //
  // Telegram gives no API to create or join a channel, so promoting the bot is
  // the one step that has to happen on the user's side. This captures the id at
  // that exact moment, which is what makes TELEGRAM_CHAT_ID optional instead of
  // something the user must copy by hand.
  const botMembership = update.my_chat_member
  if (botMembership?.chat?.id) {
    const { id, type } = botMembership.chat
    const status = botMembership.new_chat_member?.status
    // Only a channel/supergroup, and only once the bot is an admin: posting
    // alerts and minting invite links both require admin rights, so a plain
    // "member" status would record a channel we cannot actually serve.
    const isBroadcast = type === "channel" || type === "supergroup"
    const isAdmin = status === "administrator" || status === "creator"
    if (isBroadcast && isAdmin) {
      const stored = await rememberChannelId(id)
      logEvent("telegram_channel_detected", { chatType: type, stored })
    }
    return ack()
  }

  // ---- join requests: the paywall at the channel door ----------------------
  //
  // With join-request invite links, tapping a link lands here instead of adding
  // the user. approveChannelJoin re-checks the subscription server-side and only
  // then admits them, so a shared or stale link cannot buy channel access.
  const joinRequest = update.chat_join_request
  if (joinRequest?.from?.id) {
    await approveChannelJoin(joinRequest.from.id)
    return ack()
  }

  // ---- membership changes: record who actually joined or left --------------
  const memberChange = update.chat_member?.new_chat_member
  if (memberChange?.user?.id) {
    const status = memberChange.status
    if (status === "member" || status === "administrator" || status === "creator") {
      await markChannelJoined(memberChange.user.id)
    }
    return ack()
  }

  const chatId = update.message?.chat?.id
  const text = update.message?.text?.trim()
  if (typeof chatId !== "number" || !text) return ack()

  const chat = String(chatId)
  const reply = (message: string) => sendMessage(chat, message)

  // ---- /start [token] : connect the Telegram account -----------------------
  if (text.startsWith("/start")) {
    const token = text.split(/\s+/)[1]

    if (!token) {
      await reply(
        "Bienvenue sur RedMatch.\n\nPour recevoir les alertes, ouvrez votre tableau de bord RedMatch et cliquez sur « Connecter Telegram ».",
      )
      return ack()
    }

    // Identity comes from the numeric id, never the username (spec section 2).
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
      return ack()
    }

    logEvent("telegram_connection", { userId: result.userId })

    // Connected: hand over the personal channel invite right away when the
    // subscription entitles it, so the user never has to hunt for a link.
    const grant = await grantChannelAccess(result.userId)
    if (grant.ok) {
      await reply(
        `Compte Telegram connecté.\n\nVoici votre lien d'accès personnel au canal privé RedMatch Alertes :\n${grant.inviteLink}\n\nOuvrez-le puis validez la demande d'adhésion : l'accès est accordé automatiquement si votre abonnement est actif. Ce lien est personnel, à usage unique, et expire sous 15 minutes.`,
      )
      return ack()
    }

    await reply(
      grant.reason === "no_subscription"
        ? "Compte Telegram connecté.\n\nVotre abonnement n'est pas actif : dès qu'il le sera, votre lien d'accès au canal vous sera envoyé ici."
        : "Compte Telegram connecté.\n\nLe canal d'alertes n'est pas encore disponible. Réessayez depuis votre tableau de bord dans un instant.",
    )
    return ack()
  }

  // ---- /status : live verdict, straight from billing state ------------------
  if (text.startsWith("/status")) {
    const linked = await findUserByChatId(chat)
    if (!linked) {
      await reply("Ce compte Telegram n'est connecté à aucun compte RedMatch.")
      return ack()
    }

    const premium = await hasPremiumAccess(linked.userId)
    await reply(
      premium
        ? "Statut : abonnement actif. Vous recevez les alertes dans le canal RedMatch Alertes."
        : "Statut : abonnement inactif. L'accès au canal est suspendu jusqu'au renouvellement.",
    )
    return ack()
  }

  // ---- /stop : disconnect and leave the channel -----------------------------
  if (text.startsWith("/stop")) {
    const linked = await findUserByChatId(chat)
    if (linked) await revokeChannelAccess(linked.userId, "user_requested_stop")
    await unlinkTelegram({ chatId: chat })
    await reply(
      "Compte Telegram déconnecté et accès au canal retiré.\n\nVous pouvez vous reconnecter à tout moment depuis votre tableau de bord.",
    )
    return ack()
  }

  return ack()
}
