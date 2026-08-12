// Registers (or refreshes) the Telegram webhook for RedMatch.
//
// WHY THIS SCRIPT EXISTS
// Telegram only delivers the update types listed in `allowed_updates`, and that
// list defaults to EVERYTHING EXCEPT `chat_member` and `chat_join_request`.
// The channel access model depends on `chat_join_request` (the bot approves a
// join only after re-checking the Stripe subscription) and on `chat_member`
// (to record who actually joined/left). If the webhook is registered without
// naming them explicitly, those updates never arrive and nobody is ever
// admitted to the channel — silently. So this list is load-bearing, not
// cosmetic.
//
// Usage:
//   node --env-file-if-exists=/vercel/share/.env.project scripts/set-telegram-webhook.mjs https://your-domain.com
//   node scripts/set-telegram-webhook.mjs            (derives the URL from env)
//
// Requires TELEGRAM_BOT_TOKEN. Uses TELEGRAM_WEBHOOK_SECRET when present so the
// webhook route can verify the X-Telegram-Bot-Api-Secret-Token header.

const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set")
  process.exit(1)
}

// Resolve the public base URL: explicit arg wins, otherwise fall back to the
// usual deployment env vars.
const argUrl = process.argv[2]?.trim()
const envUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

const base = (argUrl || envUrl).replace(/\/+$/, "")
if (!base) {
  console.error("No base URL. Pass it as an argument: node scripts/set-telegram-webhook.mjs https://your-domain.com")
  process.exit(1)
}

const webhookUrl = `${base}/api/telegram/webhook`
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

const body = {
  url: webhookUrl,
  // The two non-default updates the access model needs, plus the message and
  // membership updates the webhook already handles. `my_chat_member` is how the
  // bot learns the channel id when it is promoted to admin.
  allowed_updates: ["message", "my_chat_member", "chat_member", "chat_join_request"],
  drop_pending_updates: false,
}
if (secret) body.secret_token = secret

try {
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) {
    console.error(`setWebhook failed: ${json.description ?? `HTTP ${res.status}`}`)
    process.exit(1)
  }
  console.log(`webhook registered: ${webhookUrl}`)
  console.log(`allowed_updates: ${body.allowed_updates.join(", ")}`)
  console.log(secret ? "secret token: configured" : "secret token: none (set TELEGRAM_WEBHOOK_SECRET to harden)")
} catch (error) {
  console.error(`request failed: ${error.message}`)
  process.exit(1)
}
