// Self-configuring Telegram webhook (no manual setup, no extra env var).
//
// Authenticity is enforced by an unguessable URL instead of a shared header
// secret. The path segment is derived deterministically from TELEGRAM_BOT_TOKEN
// with a domain-separated SHA-256, so:
//
//   * nothing new has to be stored or configured — the token we already have is
//     the single source of truth;
//   * the digest is one-way, so publishing the URL cannot leak the bot token;
//   * only Telegram is ever told the URL (via setWebhook), so a stranger cannot
//     POST fake /start or /stop commands without first guessing 160 bits.
//
// This is the documented alternative to the secret-token header: Telegram's own
// guidance is to "use a secret path in the URL". If TELEGRAM_WEBHOOK_SECRET is
// ever added later, it is layered on top automatically — no code change needed.
import "server-only"

import { createHash } from "node:crypto"

const TELEGRAM_API = "https://api.telegram.org"

/** Fixed prefix so this digest can never collide with another use of the token. */
const PATH_DERIVATION_SALT = "redmatch:telegram:webhook:v1"

/**
 * The secret URL segment for this bot. Deterministic, so every deployment of the
 * same bot computes the same value without coordination.
 */
export function webhookPathSecret(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!token) return null
  // 160 bits of the digest is ample for an unguessable path.
  return createHash("sha256").update(`${PATH_DERIVATION_SALT}:${token}`).digest("hex").slice(0, 40)
}

/** Constant-time comparison, so a wrong path cannot be probed byte by byte. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export type EnsureResult =
  | { ok: true; state: "already_set" | "registered"; url: string }
  | { ok: false; reason: "not_configured" | "not_public" | "telegram_error"; detail?: string }

// Per-instance memo: once this container has confirmed registration there is no
// reason to call Telegram again on every dashboard visit.
let confirmedUrl: string | null = null

/**
 * Registers this deployment's webhook with Telegram if it isn't already, using
 * the origin the request actually arrived on. Idempotent and safe to call often.
 *
 * Skips localhost: Telegram only delivers to public HTTPS origins, so in local
 * development this reports `not_public` instead of failing loudly.
 */
export async function ensureWebhookRegistered(origin: string): Promise<EnsureResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const secret = webhookPathSecret()
  if (!token || !secret) return { ok: false, reason: "not_configured" }

  let parsed: URL
  try {
    parsed = new URL(origin)
  } catch {
    return { ok: false, reason: "not_public" }
  }

  const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname.endsWith(".local")
  if (parsed.protocol !== "https:" || isLocal) return { ok: false, reason: "not_public" }

  const desired = `${parsed.origin}/api/telegram/webhook/${secret}`
  if (confirmedUrl === desired) return { ok: true, state: "already_set", url: desired }

  try {
    const info = await fetch(`${TELEGRAM_API}/bot${token}/getWebhookInfo`, { cache: "no-store" })
    const infoBody = (await info.json().catch(() => null)) as { ok?: boolean; result?: { url?: string } } | null

    if (infoBody?.ok && infoBody.result?.url === desired) {
      confirmedUrl = desired
      return { ok: true, state: "already_set", url: desired }
    }

    const body: Record<string, unknown> = {
      url: desired,
      // Only plain messages drive commands; ignoring the rest keeps traffic and
      // attack surface minimal.
      allowed_updates: ["message"],
      // Discard anything queued against a previous URL so a stale backlog cannot
      // replay old /start tokens.
      drop_pending_updates: true,
      max_connections: 40,
    }
    // Optional belt-and-braces: if a header secret is configured, use it too.
    const headerSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
    if (headerSecret) body.secret_token = headerSecret

    const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const payload = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null

    if (!res.ok || !payload?.ok) {
      return { ok: false, reason: "telegram_error", detail: payload?.description ?? `HTTP ${res.status}` }
    }

    confirmedUrl = desired
    return { ok: true, state: "registered", url: desired }
  } catch (error) {
    return { ok: false, reason: "telegram_error", detail: error instanceof Error ? error.message : "network error" }
  }
}
