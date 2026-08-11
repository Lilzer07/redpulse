// Applies a .sql file to the connected Supabase Postgres instance.
// Usage: node scripts/run-sql.mjs scripts/001-user-data.sql
import { readFileSync } from "node:fs"
import pg from "pg"

const file = process.argv[2]
if (!file) {
  console.error("Usage: node scripts/run-sql.mjs <file.sql>")
  process.exit(1)
}

const raw = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL
if (!raw) {
  console.error("POSTGRES_URL_NON_POOLING / POSTGRES_URL is not set")
  process.exit(1)
}

// Supabase presents a self-signed chain. Recent pg versions promote an
// `sslmode=require` query param to `verify-full`, which overrides the client's
// own ssl options, so strip it and configure TLS explicitly instead.
const url = new URL(raw)
url.searchParams.delete("sslmode")

const client = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(readFileSync(file, "utf8"))
  console.log(`applied: ${file}`)
} catch (error) {
  console.error(`failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await client.end()
}
