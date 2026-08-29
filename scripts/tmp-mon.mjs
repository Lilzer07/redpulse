import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING||"").replace(/([?&])sslmode=[^&]*/i,"$1").replace(/[?&]$/,"")
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
const t = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`)
console.log("TABLES:", t.rows.map(r=>r.table_name).join(", "))
try {
  const ms = await c.query(`SELECT * FROM monitor_state LIMIT 5`)
  console.log("\n=== monitor_state ===")
  for (const r of ms.rows) console.log(JSON.stringify(r))
} catch(e){ console.log("monitor_state err:", e.message) }
await c.end()
