import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING || "").replace(/([?&])sslmode=[^&]*/i, "$1").replace(/[?&]$/, "")
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await c.connect()
// list tables that look like logs
const t = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`)
console.log("TABLES:", t.rows.map(r=>r.table_name).join(", "))
try {
  const l = await c.query(`SELECT event, details, created_at FROM public.event_logs ORDER BY created_at DESC LIMIT 40`)
  console.log("\n=== event_logs (40) ===")
  for (const r of l.rows) console.log(r.created_at, r.event, JSON.stringify(r.details))
} catch(e){ console.log("no event_logs:", e.message) }
await c.end()
