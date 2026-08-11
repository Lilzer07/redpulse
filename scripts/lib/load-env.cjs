/**
 * Loads a dotenv-style file into process.env for local maintenance scripts.
 *
 * Values may be wrapped in single or double quotes (Supabase's generated
 * .env.development.local uses single quotes), so both are stripped. Existing
 * process.env values win, matching normal dotenv precedence.
 */
const fs = require("node:fs")
const path = require("node:path")

function loadEnv(file = ".env.development.local") {
  const abs = path.resolve(process.cwd(), file)
  if (!fs.existsSync(abs)) return {}

  const loaded = {}
  for (const rawLine of fs.readFileSync(abs, "utf8").split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const eq = line.indexOf("=")
    if (eq <= 0) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()

    // Strip a single matching pair of surrounding quotes (either style).
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
      value = value.slice(1, -1)
    }

    loaded[key] = value
    if (process.env[key] === undefined) process.env[key] = value
  }
  return loaded
}

module.exports = { loadEnv }
