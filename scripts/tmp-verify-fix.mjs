import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING || "").replace(/([?&])sslmode=[^&]*/i, "$1").replace(/[?&]$/, "")
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await c.connect()

// Pick a real active row.
const row = (await c.query(`SELECT user_id, plan, status FROM public.subscriptions WHERE status='active' LIMIT 1`)).rows[0]
if (!row) { console.log("no active row to test"); await c.end(); process.exit(0) }
console.log("BEFORE:", row)

await c.query("BEGIN")
// Simulate the NEW update-first path (no `plan` provided) exactly.
const upd = await c.query(
  `UPDATE public.subscriptions SET status=$2, current_period_end=NULL, updated_at=now() WHERE user_id=$1 RETURNING user_id, plan, status, current_period_end`,
  [row.user_id, "canceled"],
)
console.log("AFTER UPDATE (no plan):", upd.rows[0], "rowCount:", upd.rowCount)
await c.query("ROLLBACK")

// Confirm rollback left it untouched.
const after = (await c.query(`SELECT status FROM public.subscriptions WHERE user_id=$1`, [row.user_id])).rows[0]
console.log("POST-ROLLBACK status (must still be active):", after.status)
await c.end()
