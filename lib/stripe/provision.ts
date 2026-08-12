import "server-only"

import { getConfigValue, setConfigValue } from "@/lib/config-store"
import { logEvent } from "@/lib/logging"
import { stripeClient } from "./sync"

/**
 * Events the app acts on. Kept in sync with the switch in the webhook route:
 * subscribing to fewer events would silently break access changes, and to more
 * would waste deliveries.
 */
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
] as const

/**
 * Self-provisioning of the Stripe webhook endpoint.
 *
 * Rather than asking the operator to create the endpoint in the Stripe dashboard
 * and paste the signing secret into env vars, the app registers the endpoint
 * itself and stores the returned signing secret in `app_config`.
 *
 * Signature verification is never bypassed: the secret is only ever obtained
 * from Stripe itself, and a request with no verifiable secret is rejected.
 */

const CONFIG_KEY = "stripe_webhook_secret"
const CONFIG_URL_KEY = "stripe_webhook_url"

/**
 * Resolves the public origin of this deployment.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` is injected by Vercel and always points at the
 * stable production domain, which is what the Stripe endpoint must target — a
 * per-deployment preview URL would stop receiving events on the next deploy.
 */
export function resolvePublicOrigin(): string | null {
  const explicit = process.env.APP_PUBLIC_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, "")

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) return `https://${production.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`

  return null
}

/** The webhook URL Stripe should deliver to. */
export function resolveWebhookUrl(): string | null {
  const origin = resolvePublicOrigin()
  return origin ? `${origin}/api/stripe/webhook` : null
}

/**
 * Returns the signing secret used to verify incoming Stripe requests.
 *
 * An explicit env var wins, so an operator can always override; otherwise the
 * self-provisioned secret is used.
 */
export async function getWebhookSigningSecret(): Promise<string | null> {
  const fromEnv = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (fromEnv) return fromEnv
  return getConfigValue(CONFIG_KEY)
}

export type ProvisionResult =
  | { ok: true; url: string; created: boolean }
  | { ok: false; reason: "stripe_not_configured" | "url_unknown" | "storage_unavailable" | "stripe_error" }

/**
 * Ensures a Stripe webhook endpoint exists for this deployment and that its
 * signing secret is stored. Safe to call repeatedly: it exits early once a
 * secret is present for the current URL.
 */
export async function ensureWebhookConfigured(): Promise<ProvisionResult> {
  const stripe = stripeClient()
  if (!stripe) return { ok: false, reason: "stripe_not_configured" }

  const url = resolveWebhookUrl()
  if (!url) return { ok: false, reason: "url_unknown" }

  // Already provisioned for this exact URL: nothing to do.
  const [existingSecret, existingUrl] = await Promise.all([getWebhookSigningSecret(), getConfigValue(CONFIG_URL_KEY)])
  if (existingSecret && existingUrl === url) {
    return { ok: true, url, created: false }
  }

  try {
    // Stripe only reveals a signing secret at creation time. If an endpoint for
    // this URL already exists but we hold no secret for it, replace it so we end
    // up with a secret we can actually verify against.
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
    const stale = endpoints.data.filter((endpoint) => endpoint.url === url)
    for (const endpoint of stale) {
      await stripe.webhookEndpoints.del(endpoint.id)
    }

    const created = await stripe.webhookEndpoints.create({
      url,
      enabled_events: [...WEBHOOK_EVENTS],
      description: "RedMatch — accès Telegram (auto-configuré)",
    })

    const secret = created.secret
    if (!secret) {
      logEvent("stripe_webhook_provision_failed", { url, reason: "no_secret_returned" })
      return { ok: false, reason: "stripe_error" }
    }

    const storedSecret = await setConfigValue(CONFIG_KEY, secret)
    const storedUrl = await setConfigValue(CONFIG_URL_KEY, url)
    if (!storedSecret || !storedUrl) {
      logEvent("stripe_webhook_provision_failed", { url, reason: "storage_unavailable" })
      return { ok: false, reason: "storage_unavailable" }
    }

    logEvent("stripe_webhook_provisioned", { url, replaced: stale.length })
    return { ok: true, url, created: true }
  } catch (error) {
    logEvent("stripe_webhook_provision_failed", {
      url,
      reason: error instanceof Error ? error.message : "unknown",
    })
    return { ok: false, reason: "stripe_error" }
  }
}
