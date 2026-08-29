import pg from "pg"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const url = (process.env.POSTGRES_URL_NON_POOLING||"").replace(/([?&])sslmode=[^&]*/i,"$1").replace(/[?&]$/,"")
const c = new pg.Client({ connectionString: url, ssl:{ rejectUnauthorized:false } })
await c.connect()
const rc = await c.query(`SELECT detected_at, dispatched_at, league_name, home_team, away_team, player, team, minute, detail FROM red_card_events ORDER BY detected_at DESC LIMIT 12`)
console.log("=== 12 derniers red_card_events ===")
for (const r of rc.rows) console.log(`${r.detected_at?.toISOString?.()||r.detected_at} | ${r.league_name} | ${r.home_team}-${r.away_team} | ${r.player} (${r.team}) ${r.minute}' | detail=${r.detail} | dispatched=${!!r.dispatched_at}`)
const kel = await c.query(`SELECT detected_at, league_name, home_team, away_team, player, minute, detail FROM red_card_events WHERE player ILIKE '%keller%' OR home_team ILIKE '%heidenheim%' OR away_team ILIKE '%dresden%' ORDER BY detected_at DESC LIMIT 10`)
console.log("\n=== Heidenheim/Dresden/Keller ===", kel.rows.length, "ligne(s)")
for (const r of kel.rows) console.log(JSON.stringify(r))
const today = await c.query(`SELECT count(*) n, min(detected_at) mn, max(detected_at) mx FROM red_card_events WHERE detected_at::date = CURRENT_DATE`)
console.log("\n=== aujourd'hui ===", JSON.stringify(today.rows[0]))
await c.end()
