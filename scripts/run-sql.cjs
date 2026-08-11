/**
 * Applies a .sql file to the Supabase Postgres database.
 *
 * Usage: node scripts/run-sql.cjs scripts/003-red-card-monitoring.sql
 *
 * Uses the non-pooling connection because migrations run DDL, which does not
 * play well with a transaction pooler.
 */
const fs = require("node:fs")
const { Client } = require("pg")
const { loadEnv } = require("./lib/load-env.cjs")

loadEnv()

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error("Usage: node scripts/run-sql.cjs <file.sql>")
    process.exit(1)
  }

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!connectionString) {
    console.error("POSTGRES_URL_NON_POOLING is not set")
    process.exit(1)
  }

  const sql = fs.readFileSync(file, "utf8")

  // Supabase URLs carry `sslmode=require`, which pg now treats as `verify-full`
  // and rejects because the chain is self-signed. Strip the param so our own
  // ssl option below applies instead.
  const cleaned = connectionString.replace(/([?&])sslmode=[^&]*(&|$)/, (_m, p1, p2) =>
    p2 === "&" ? p1 : p1 === "?" ? "" : "",
  )
  const client = new Client({ connectionString: cleaned, ssl: { rejectUnauthorized: false } })

  await client.connect()
  try {
    await client.query(sql)
    console.log(`applied: ${file}`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error("SQL failed:", error.message)
  process.exit(1)
})
