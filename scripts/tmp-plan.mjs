import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING||"").replace(/([?&])sslmode=[^&]*/i,"$1").replace(/[?&]$/,"")
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
const cons = await c.query(`SELECT con.conname, pg_get_constraintdef(con.oid) def FROM pg_constraint con JOIN pg_class rel ON rel.oid=con.conrelid JOIN pg_namespace n ON n.oid=rel.relnamespace WHERE rel.relname='subscriptions' AND n.nspname='public'`)
console.log("CONSTRAINTS:"); cons.rows.forEach(r=>console.log(" ", r.conname, "=>", r.def))
const col = await c.query(`SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' ORDER BY ordinal_position`)
console.log("\nCOLUMNS:"); col.rows.forEach(r=>console.log(" ", r.column_name, r.is_nullable, r.column_default||""))
const pl = await c.query(`SELECT DISTINCT plan FROM public.subscriptions`)
console.log("\nDISTINCT plan:", pl.rows.map(r=>r.plan))
await c.end()
