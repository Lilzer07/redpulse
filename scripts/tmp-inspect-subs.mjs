import pg from "pg"

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL_NON_POOLING })
await client.connect()

const check = await client.query(`
  SELECT con.conname, pg_get_constraintdef(con.oid) AS def
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname='subscriptions' AND nsp.nspname='public'
`)
console.log("=== CONSTRAINTS on subscriptions ===")
for (const r of check.rows) console.log(`${r.conname}: ${r.def}`)

const idx = await client.query(`
  SELECT indexname, indexdef FROM pg_indexes
  WHERE schemaname='public' AND tablename='subscriptions'
`)
console.log("\n=== INDEXES on subscriptions ===")
for (const r of idx.rows) console.log(`${r.indexname}: ${r.indexdef}`)

const cols = await client.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='subscriptions'
  ORDER BY ordinal_position
`)
console.log("\n=== COLUMNS ===")
for (const r of cols.rows) console.log(`${r.column_name} ${r.data_type} nullable=${r.is_nullable}`)

const rows = await client.query(`
  SELECT user_id, status, cancel_at_period_end, current_period_end, stripe_subscription_id, updated_at
  FROM public.subscriptions ORDER BY updated_at DESC NULLS LAST LIMIT 20
`)
console.log("\n=== ROWS (max 20) ===")
for (const r of rows.rows) {
  console.log(JSON.stringify(r))
}

await client.end()
