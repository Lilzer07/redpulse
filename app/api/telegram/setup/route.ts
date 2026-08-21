// One-shot Telegram setup + diagnostics endpoint.
//
// WHY THIS EXISTS
// Registering the webhook requires TELEGRAM_BOT_TOKEN, which only exists on the
// deployment — never in a local shell or a build sandbox. Doing it from a laptop
// therefore means pulling production secrets down first. This route flips that
// around: the work happens on the server that already holds the token, and the
// caller only needs CRON_SECRET. Nothing secret travels in either direction.
//
// It is machine-only for the same reason as /api/monitor: it mutates the bot's
// webhook configuration, so it sits behind the same bearer guard and is never
// callable from the browser.
//
//   POST  → register the webhook, then report the full setup state
//   GET   → report only (never mutates), for re-checking after promoting the bot
import { NextResponse } from "next/server"

import { guardMachineRequest } from "@/lib/api/guard"
import { logEvent } from "@/lib/logging"
import {
  getChannelReadiness,
  getWebhookStatus,
  registerWebhook,
  REQUIRED_WEBHOOK_UPDATES,
} from "@/lib/telegram/service"

export const dynamic = "force-dynamic"

/**
 * The public origin to register with Telegram.
 *
 * Taken from the incoming request rather than an env var: whatever host was used
 * to reach this route is by definition a host Telegram can reach too. An explicit
 * `?baseUrl=` wins so a custom domain can be pinned even when called via a
 * deployment URL.
 */
function resolveBaseUrl(request: Request): string {
  const url = new URL(request.url)
  const override = url.searchParams.get("baseUrl")?.trim()
  if (override) return override.replace(/\/+$/, "")
  return url.origin
}

/** Turns the raw checks into the concrete next action, so the caller never has to guess. */
function summarise(
  webhookUrl: string | null,
  missingUpdates: string[],
  readiness: Awaited<ReturnType<typeof getChannelReadiness>>,
): { ready: boolean; nextStep: string | null } {
  if (!webhookUrl) {
    return { ready: false, nextStep: "Webhook is not registered. Call this route with POST." }
  }
  if (missingUpdates.length > 0) {
    return {
      ready: false,
      nextStep: `Webhook is missing update types (${missingUpdates.join(", ")}). Re-register with POST.`,
    }
  }
  if (!readiness.channelKnown) {
    return {
      ready: false,
      nextStep:
        "Bot not yet linked to a channel id. Ensure it is an ADMINISTRATOR of the private channel, then post any message in that channel (or demote/re-promote the bot). Either event records the id automatically.",
    }
  }
  if (readiness.botStatus !== "administrator") {
    return {
      ready: false,
      nextStep: `The bot is "${readiness.botStatus ?? "unknown"}" in the channel; it must be an administrator.`,
    }
  }
  const missingRights = [
    !readiness.canInviteUsers ? "can_invite_users (mint single-use invite links)" : null,
    !readiness.canPostMessages ? "can_post_messages (publish alerts)" : null,
    !readiness.canRestrictMembers ? "can_restrict_members (eject foreign/unpaid joins)" : null,
  ].filter(Boolean)
  if (missingRights.length > 0) {
    return { ready: false, nextStep: `Enable these admin rights on the bot: ${missingRights.join(", ")}.` }
  }
  return { ready: true, nextStep: null }
}

async function report(registered: { url: string; secured: boolean } | null) {
  const status = await getWebhookStatus()
  if (!status.ok) {
    return NextResponse.json(
      {
        ok: false,
        // "not_configured" here means the bot token itself is missing from the
        // deployment, which is a different fix from a missing channel.
        error:
          status.reason === "not_configured"
            ? "TELEGRAM_BOT_TOKEN is not configured on this deployment."
            : status.detail,
      },
      { status: status.reason === "not_configured" ? 503 : 502 },
    )
  }

  const readiness = await getChannelReadiness()
  const { ready, nextStep } = summarise(status.url, [...status.missingUpdates], readiness)

  return NextResponse.json({
    ok: true,
    ready,
    nextStep,
    registered,
    webhook: {
      url: status.url,
      allowedUpdates: status.allowedUpdates,
      requiredUpdates: [...REQUIRED_WEBHOOK_UPDATES],
      missingUpdates: status.missingUpdates,
      pendingUpdates: status.pendingUpdates,
      lastError: status.lastError,
    },
    channel: readiness,
  })
}

export async function POST(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const result = await registerWebhook(resolveBaseUrl(request))
  if (!result.ok) {
    logEvent("telegram_webhook_register_failed", {
      reason: result.reason,
      detail: result.reason === "api_error" ? result.detail : null,
    })
    return NextResponse.json(
      {
        ok: false,
        error:
          result.reason === "not_configured"
            ? "TELEGRAM_BOT_TOKEN is not configured on this deployment."
            : result.detail,
      },
      { status: result.reason === "not_configured" ? 503 : 502 },
    )
  }

  logEvent("telegram_webhook_registered", { url: result.url, secured: result.secured })
  return await report({ url: result.url, secured: result.secured })
}

/** Read-only re-check: safe to call repeatedly while fixing the channel setup. */
export async function GET(request: Request) {
  const guard = guardMachineRequest(request)
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  return await report(null)
}
