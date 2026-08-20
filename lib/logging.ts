// Structured server logging (spec section 11).
//
// Secrets must never reach the logs, so this deliberately does not accept free
// text: callers pass named fields, and anything that looks like a credential is
// redacted before printing. Keeping one helper also makes the required events
// (stripe_webhook_received, telegram_invite_generated, ...) greppable.
import "server-only"

export type LogEvent =
  | "stripe_webhook_received"
  | "stripe_subscription_updated"
  | "stripe_webhook_rejected"
  | "stripe_webhook_provisioned"
  | "stripe_webhook_provision_failed"
  | "stripe_portal_failed"
  | "stripe_reconciled"
  | "telegram_connection"
  | "telegram_invite_generated"
  | "telegram_invite_failed"
  | "telegram_user_removed"
  | "telegram_membership_swept"
  | "telegram_join_approved"
  | "telegram_join_declined"
  | "telegram_alert_sent"
  | "telegram_alert_failed"
  | "telegram_channel_detected"
  | "telegram_channel_published"
  | "telegram_webhook_registered"
  | "telegram_webhook_register_failed"
  | "telegram_webhook_rejected"
  | "telegram_test_alert_sent"
  | "telegram_test_alert_failed"
  | "ai_analysis_generated"
  | "ai_analysis_failed"

/** Field names whose values are never safe to print. */
const SENSITIVE = /(token|secret|key|password|authorization|signature)/i

/**
 * Truncates and redacts one value. Long strings are clipped because Telegram
 * invite links and Stripe ids are identifying but not useful at full length.
 */
function safe(key: string, value: unknown): unknown {
  if (SENSITIVE.test(key)) return "[redacted]"
  if (typeof value === "string") return value.length > 120 ? `${value.slice(0, 117)}...` : value
  return value
}

/** Logs one named event with redacted fields, prefixed for easy filtering. */
export function logEvent(event: LogEvent, fields: Record<string, unknown> = {}): void {
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) payload[key] = safe(key, value)
  console.log(`[redmatch] ${event}`, JSON.stringify(payload))
}
