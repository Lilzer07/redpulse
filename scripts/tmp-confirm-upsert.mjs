import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING || "").replace(/([?&])sslmode=[^&]*/i, "$1").replace(/[?&]$/, "")
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await c.connect()

// Use an EXISTING row's user_id so we hit the ON CONFLICT path. Everything runs
// inside a transaction that is ALWAYS rolled back — no production data changes.
const existing = await c.query(`SELECT user_id FROM public.subscriptions LIMIT 1`)
const uid = existing.rows[0].user_id
console.log("Test user_id:", uid)

await c.query("BEGIN")
try {
  // Mirror EXACTLY what syncSubscription sends on cancel: NO plan column.
  await c.query(
    `INSERT INTO public.subscriptions (user_id, status, current_period_end, updated_at)
     VALUES ($1, 'canceled', NULL, now())
     ON CONFLICT (user_id) DO UPDATE SET status = EXCLUDED.status, current_period_end = EXCLUDED.current_period_end, updated_at = EXCLUDED.updated_at`,
    [uid],
  )
  console.log("RESULT (no plan): SUCCEEDED  -> not the cause")
} catch (e) {
  console.log("RESULT (no plan): FAILED  -> ROOT CAUSE CONFIRMED")
  console.log("   ", e.code, e.message)
}
await c.query("ROLLBACK")

// Control: same upsert WITH plan should succeed.
await c.query("BEGIN")
try {
  await c.query(
    `INSERT INTO public.subscriptions (user_id, plan, status, current_period_end, updated_at)
     VALUES ($1, 'monthly', 'canceled', NULL, now())
     ON CONFLICT (user_id) DO UPDATE SET status = EXCLUDED.status, current_period_end = EXCLUDED.current_period_end, updated_at = EXCLUDED.updated_at`,
    [uid],
  )
  console.log("CONTROL (with plan): SUCCEEDED  -> confirms fix direction")
} catch (e) {
  console.log("CONTROL (with plan): FAILED", e.code, e.message)
}
await c.query("ROLLBACK")

await c.end()
