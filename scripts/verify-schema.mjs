// Confirms the per-user tables exist, RLS is enabled, and the signup trigger
// is attached. Read-only: safe to re-run at any time.
import pg from "pg"

const raw = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL
const url = new URL(raw)
url.searchParams.delete("sslmode")
const client = new pg.Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } })

await client.connect()

const tables = await client.query(`
  select c.relname as table, c.relrowsecurity as rls,
         (select count(*) from pg_policies p where p.tablename = c.relname) as policies
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
    and c.relname in ('profiles','user_competitions','telegram_settings','alerts')
  order by c.relname
`)

console.log("table                RLS    policies")
for (const r of tables.rows) {
  console.log(`${r.table.padEnd(20)} ${String(r.rls).padEnd(6)} ${r.policies}`)
}

const trigger = await client.query(
  `select tgname from pg_trigger where tgname = 'on_auth_user_created' and not tgisinternal`,
)
console.log(`\ntrigger on_auth_user_created: ${trigger.rowCount ? "present" : "MISSING"}`)

await client.end()
