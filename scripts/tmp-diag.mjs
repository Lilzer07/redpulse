import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING||"").replace(/([?&])sslmode=[^&]*/i,"$1").replace(/[?&]$/,"")
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
// monitor_state complet
const ms = await c.query(`SELECT * FROM monitor_state`)
console.log("=== monitor_state ===")
for (const r of ms.rows) console.log(JSON.stringify(r, null, 0))
// tables de logs disponibles
const t = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ~* 'log|event|alert|monitor'`)
console.log("\n=== tables log/event ===", t.rows.map(r=>r.table_name).join(", "))
await c.end()
