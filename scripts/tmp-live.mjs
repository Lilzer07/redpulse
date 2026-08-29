const key = (process.env.FOOTBALL_API_KEY||"").trim()
const base = "https://v3.football.api-sports.io"
const h = { "x-apisports-key": key }
// 1) matchs en direct de la 2.Bundesliga (id 79)
const live = await fetch(`${base}/fixtures?live=79`, { headers: h }).then(r=>r.json())
console.log("live count (league 79):", live.response?.length, "errors:", JSON.stringify(live.errors||{}))
let fixtureId = null
for (const f of live.response||[]) {
  console.log("  FIX", f.fixture.id, "|", f.teams.home.name, "vs", f.teams.away.name, "|", f.fixture.status.short, f.fixture.status.elapsed+"'")
  if (/heidenheim/i.test(f.teams.home.name) || /dresden/i.test(f.teams.away.name)) fixtureId = f.fixture.id
}
// fallback: chercher par équipe si pas trouvé en live
if (!fixtureId) {
  const all = await fetch(`${base}/fixtures?live=all`, { headers: h }).then(r=>r.json())
  console.log("\nlive ALL count:", all.response?.length)
  for (const f of all.response||[]) {
    if (/heidenheim/i.test(f.teams.home.name) || /dresden/i.test(f.teams.away.name)) {
      fixtureId = f.fixture.id
      console.log("  FOUND in live=all:", f.fixture.id, f.league.id, f.league.name, "|", f.teams.home.name, "vs", f.teams.away.name)
    }
  }
}
if (fixtureId) {
  const ev = await fetch(`${base}/fixtures/events?fixture=${fixtureId}`, { headers: h }).then(r=>r.json())
  console.log("\n=== events fixture", fixtureId, "===")
  for (const e of ev.response||[]) console.log(`  ${e.time.elapsed}' | ${e.type} | ${e.detail} | ${e.player?.name} (${e.team?.name})`)
} else {
  console.log("\nMatch Heidenheim-Dresden introuvable dans les live actuels")
}
