// Registers (or refreshes) the Telegram webhook for RedMatch AND verifies the
// whole channel-access setup in one run.
//
// WHY THIS SCRIPT EXISTS
// Telegram only delivers the update types listed in `allowed_updates`, and that
// list defaults to EVERYTHING EXCEPT `chat_member`. The direct-join access model
// depends on `chat_member` (who joined, via which single-use link — the security
// check re-verifies the account + Stripe and kicks foreign joins) and on
// `my_chat_member` (how the bot learns the channel id when promoted to admin).
// If the webhook is registered without naming them explicitly, those updates
// never arrive and the join check never runs — silently. So this list is
// load-bearing.
//
// USAGE (run where TELEGRAM_BOT_TOKEN is available — e.g. Vercel, or locally
// after `vercel env pull`). The token is read from the environment; never pass
// it on the command line.
//
//   # Register the webhook, then verify everything:
//   node scripts/set-telegram-webhook.mjs https://red-match.com
//
//   # Only verify (does not touch the webhook):
//   node scripts/set-telegram-webhook.mjs --check
//
// Optional env:
//   TELEGRAM_WEBHOOK_SECRET  sent as secret_token so the route can verify the
//                            X-Telegram-Bot-Api-Secret-Token header.
//   TELEGRAM_CHAT_ID         pins the channel explicitly; otherwise the id is
//                            read from app_config (auto-discovered on promotion).
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  used only to read the discovered
//                            channel id when TELEGRAM_CHAT_ID is not set.

const API = "https://api.telegram.org"

const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
if (!token) {
  console.error("✗ TELEGRAM_BOT_TOKEN is not set. Run this where the bot token is available (Vercel env, or `vercel env pull`).")
  process.exit(1)
}

const checkOnly = process.argv.includes("--check")

// The permissions the direct-join access model actually relies on.
const REQUIRED_ADMIN_RIGHTS = [
  ["can_invite_users", "mint single-use invite links"],
  ["can_post_messages", "publish red-card alerts to the channel"],
  ["can_restrict_members", "eject a foreign/unpaid account that used a link"],
]

// Keep in sync with REQUIRED_WEBHOOK_UPDATES in lib/telegram/service.ts.
// `chat_member` is what reveals who joined and via which link (the direct-join
// security check). `channel_post` lets any message in the channel re-teach the
// channel id when the my_chat_member promotion event was missed (self-healing).
const REQUIRED_UPDATES = ["message", "my_chat_member", "chat_member", "channel_post"]

/** Calls the Bot API. The token only ever travels in the URL path. */
async function tg(method, body) {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  })
  return res.json()
}

/** Resolves the base URL: explicit arg wins, otherwise deployment env vars. */
function resolveBaseUrl() {
  const arg = process.argv[2]?.trim()
  if (arg && !arg.startsWith("--")) return arg.replace(/\/+$/, "")
  const env =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  return env.replace(/\/+$/, "")
}

/** Reads the channel id from env, or the auto-discovered value in app_config. */
async function resolveChannelId() {
  const fromEnv = process.env.TELEGRAM_CHAT_ID?.trim()
  if (fromEnv) return { id: fromEnv, source: "TELEGRAM_CHAT_ID env" }

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return { id: null, source: "no TELEGRAM_CHAT_ID and no Supabase access" }

  try {
    const res = await fetch(`${url}/rest/v1/app_config?key=eq.telegram_chat_id&select=value`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    const rows = await res.json()
    const value = Array.isArray(rows) && rows[0]?.value ? String(rows[0].value).trim() : null
    return { id: value || null, source: "app_config (auto-discovered)" }
  } catch {
    return { id: null, source: "app_config read failed" }
  }
}

async function registerWebhook() {
  const base = resolveBaseUrl()
  if (!base) {
    console.error("✗ No base URL. Pass it explicitly: node scripts/set-telegram-webhook.mjs https://red-match.com")
    process.exit(1)
  }
  const webhookUrl = `${base}/api/telegram/webhook`
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

  const body = { url: webhookUrl, allowed_updates: REQUIRED_UPDATES, drop_pending_updates: false }
  if (secret) body.secret_token = secret

  const json = await tg("setWebhook", body)
  if (!json.ok) {
    console.error(`✗ setWebhook failed: ${json.description ?? "unknown error"}`)
    process.exit(1)
  }
  console.log(`✓ Webhook registered → ${webhookUrl}`)
  console.log(`  secret token: ${secret ? "configured" : "NONE (set TELEGRAM_WEBHOOK_SECRET to harden)"}`)
}

async function verify() {
  let ok = true

  // 1) Webhook info: URL set, and chat_member among allowed_updates.
  const info = await tg("getWebhookInfo")
  const r = info.result ?? {}
  const allowed = r.allowed_updates ?? []
  console.log("\n— Webhook —")
  console.log(`  url: ${r.url || "(none)"}`)
  console.log(`  allowed_updates: ${allowed.length ? allowed.join(", ") : "(default — MISSING the ones we need)"}`)
  console.log(`  pending updates: ${r.pending_update_count ?? 0}`)
  if (r.last_error_message) console.log(`  ⚠ last error: ${r.last_error_message}`)

  for (const u of ["my_chat_member", "chat_member"]) {
    if (!allowed.includes(u)) {
      console.log(`  ✗ '${u}' is NOT in allowed_updates — those updates will never arrive`)
      ok = false
    }
  }
  if (ok) console.log("  ✓ my_chat_member / chat_member are enabled")

  // 2) Channel + bot admin rights.
  console.log("\n— Channel & bot admin rights —")
  const { id: channel, source } = await resolveChannelId()
  if (!channel) {
    console.log(`  ✗ Channel id unknown (${source}).`)
    console.log("    Fix: with the webhook now registered, add the bot to the private channel as ADMINISTRATOR")
    console.log("    (or re-promote it) — the my_chat_member update will auto-record the id. Or set TELEGRAM_CHAT_ID.")
    return false
  }
  console.log(`  channel id: ${channel}  [${source}]`)

  const me = await tg("getMe")
  if (!me.ok) {
    console.log(`  ✗ getMe failed: ${me.description}`)
    return false
  }
  const member = await tg("getChatMember", { chat_id: channel, user_id: me.result.id })
  if (!member.ok) {
    console.log(`  ✗ getChatMember failed: ${member.description}`)
    console.log("    The bot is probably not a member/admin of that channel yet.")
    return false
  }
  const status = member.result.status
  console.log(`  bot @${me.result.username} status in channel: ${status}`)
  if (status !== "administrator") {
    console.log("  ✗ The bot must be an ADMINISTRATOR of the channel.")
    return false
  }
  for (const [right, why] of REQUIRED_ADMIN_RIGHTS) {
    if (member.result[right]) {
      console.log(`  ✓ ${right} — ${why}`)
    } else {
      console.log(`  ✗ ${right} is OFF — needed to ${why}`)
      ok = false
    }
  }
  return ok
}

if (!checkOnly) await registerWebhook()
const verified = await verify()
console.log(verified ? "\n✅ All checks passed." : "\n❌ Setup incomplete — see the ✗ lines above.")
process.exit(verified ? 0 : 1)
