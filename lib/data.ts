// Central data layer for RedMatch.
// Frontend-first: values are simulated but structured so real API/Supabase
// data can be swapped in without touching UI components.

export type Competition = {
  id: string
  name: string
  country: string
  tier: "league" | "cup" | "european"
  color: string
  abbr: string
  /**
   * Path to the official league badge in /public/logos ({id}.png).
   * Badges are sourced once (TheSportsDB, with Wikimedia Commons as fallback
   * for the two competitions TheSportsDB lacks) and stored locally, so they
   * are browser-cached and lazy-loaded with no runtime API call. Every
   * competition now ships a real logo — no initials chips.
   */
  logo?: string
}

export const competitions: Competition[] = [
  { id: "premier-league", name: "Premier League", country: "Angleterre", tier: "league", color: "#3D195B", abbr: "PL", logo: "/logos/premier-league.png" },
  { id: "championship", name: "Championship", country: "Angleterre", tier: "league", color: "#1B458F", abbr: "CH", logo: "/logos/championship.png" },
  { id: "ligue-1", name: "Ligue 1", country: "France", tier: "league", color: "#091C3E", abbr: "L1", logo: "/logos/ligue-1.png" },
  { id: "ligue-2", name: "Ligue 2", country: "France", tier: "league", color: "#0B3D91", abbr: "L2", logo: "/logos/ligue-2.png" },
  { id: "laliga", name: "LaLiga", country: "Espagne", tier: "league", color: "#E30613", abbr: "LL", logo: "/logos/laliga.png" },
  { id: "laliga-2", name: "LaLiga 2", country: "Espagne", tier: "league", color: "#00529F", abbr: "L2", logo: "/logos/laliga-2.png" },
  { id: "serie-a", name: "Serie A", country: "Italie", tier: "league", color: "#008FD7", abbr: "SA", logo: "/logos/serie-a.png" },
  { id: "serie-b", name: "Serie B", country: "Italie", tier: "league", color: "#00A551", abbr: "SB", logo: "/logos/serie-b.png" },
  { id: "bundesliga", name: "Bundesliga", country: "Allemagne", tier: "league", color: "#D20515", abbr: "BL", logo: "/logos/bundesliga.png" },
  { id: "2-bundesliga", name: "2. Bundesliga", country: "Allemagne", tier: "league", color: "#E30613", abbr: "B2", logo: "/logos/2-bundesliga.png" },
  { id: "liga-portugal", name: "Liga Portugal", country: "Portugal", tier: "league", color: "#006940", abbr: "LP", logo: "/logos/liga-portugal.png" },
  { id: "liga-portugal-2", name: "Liga Portugal 2", country: "Portugal", tier: "league", color: "#00843D", abbr: "P2", logo: "/logos/liga-portugal-2.png" },
  // Newer leagues: badge resolved from the real API-Football league id rather
  // than a bundled asset, so no logo is hardcoded per competition.
  { id: "eredivisie", name: "Eredivisie", country: "Pays-Bas", tier: "league", color: "#FF6600", abbr: "ERE", logo: "https://media.api-sports.io/football/leagues/88.png" },
  { id: "super-lig", name: "Süper Lig", country: "Turquie", tier: "league", color: "#E30A17", abbr: "SL", logo: "https://media.api-sports.io/football/leagues/203.png" },
  { id: "jupiler-pro-league", name: "Jupiler Pro League", country: "Belgique", tier: "league", color: "#E4022E", abbr: "JPL", logo: "https://media.api-sports.io/football/leagues/144.png" },
  { id: "super-league-suisse", name: "Super League", country: "Suisse", tier: "league", color: "#E30613", abbr: "SLS", logo: "https://media.api-sports.io/football/leagues/207.png" },
  { id: "saudi-pro-league", name: "Saudi Pro League", country: "Arabie saoudite", tier: "league", color: "#006C35", abbr: "SPL", logo: "https://media.api-sports.io/football/leagues/307.png" },
  { id: "champions-league", name: "Champions League", country: "Europe", tier: "european", color: "#0B1B54", abbr: "UCL", logo: "/logos/champions-league.png" },
  { id: "europa-league", name: "Europa League", country: "Europe", tier: "european", color: "#FF6900", abbr: "UEL", logo: "/logos/europa-league.png" },
  { id: "conference-league", name: "Conference League", country: "Europe", tier: "european", color: "#00B54A", abbr: "UECL", logo: "/logos/conference-league.png" },
  { id: "fa-cup", name: "FA Cup", country: "Angleterre", tier: "cup", color: "#C8102E", abbr: "FA", logo: "/logos/fa-cup.png" },
  { id: "coupe-de-france", name: "Coupe de France", country: "France", tier: "cup", color: "#002395", abbr: "CDF", logo: "/logos/coupe-de-france.png" },
  { id: "copa-del-rey", name: "Copa del Rey", country: "Espagne", tier: "cup", color: "#C60B1E", abbr: "CDR", logo: "/logos/copa-del-rey.png" },
  { id: "coppa-italia", name: "Coppa Italia", country: "Italie", tier: "cup", color: "#0066A1", abbr: "CI", logo: "/logos/coppa-italia.png" },
  { id: "dfb-pokal", name: "DFB Pokal", country: "Allemagne", tier: "cup", color: "#000000", abbr: "DFB", logo: "/logos/dfb-pokal.png" },
  { id: "taca-de-portugal", name: "Taça de Portugal", country: "Portugal", tier: "cup", color: "#006600", abbr: "TDP", logo: "/logos/taca-de-portugal.png" },
]

export type Feature = {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: "sparkles",
    title: "Analyse instantanée",
    description:
      "Dès qu’un carton rouge tombe, RedMatch analyse le contexte du match et en calcule l’indice de confiance.",
  },
  {
    icon: "gauge",
    title: "Indice de confiance sur 100",
    description:
      "Une lecture immédiate de l’importance du carton sur l’issue du match, en un seul chiffre.",
  },
  {
    icon: "send",
    title: "Notification Telegram enrichie",
    description:
      "L’analyse complète arrive directement dans Telegram, quelques secondes après le carton.",
  },
  {
    icon: "target",
    title: "Probabilités simples",
    description:
      "But supplémentaire et victoire du favori, sans xG ni jargon : une lecture claire et rapide.",
  },
  {
    icon: "globe",
    title: "Grandes compétitions",
    description:
      "Les championnats et coupes les plus importants d’Europe, surveillés en continu.",
  },
  {
    icon: "activity",
    title: "Données en temps réel",
    description:
      "Le contexte du match est récupéré automatiquement à la détection du carton rouge.",
  },
]

export const steps = [
  { step: "01", title: "Carton rouge détecté", description: "Un carton rouge tombe : c’est le déclencheur. RedMatch le repère instantanément." },
  { step: "02", title: "Données récupérées", description: "Le contexte du match est collecté automatiquement : score, minute, équipes." },
  { step: "03", title: "Analyse de la situation", description: "Le copilote calcule l’indice de confiance et les probabilités clés du match." },
  { step: "04", title: "Telegram enrichi envoyé", description: "Vous recevez l’analyse complète dans Telegram en quelques secondes." },
]

export type Stat = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  /** Developer-facing fallback; the rendered text comes from `t.stats.labels`. */
  label: string
}

/**
 * Only claims we can actually stand behind.
 *
 * Deliberately removed: a "99.99% uptime" figure that was never measured and is
 * not guaranteed anywhere, and a "< 2s average analysis" headline that
 * misrepresented the product — what a user waits for is the polling cadence, not
 * the speed of a single analysis.
 *
 * The cadence figure below must track MONITOR_CONFIG.intervalSeconds in
 * lib/football/monitor.ts. Changing one without the other turns this into the
 * same kind of unverifiable claim the two figures above were removed for.
 *
 * Labels are matched BY INDEX against `t.stats.labels`: keep both lists the
 * same length and order.
 */
export const stats: Stat[] = [
  { value: competitions.length, label: "Compétitions couvertes" },
  { value: 60, suffix: " s", label: "Fréquence de vérification" },
  { value: 24, suffix: "h/24", label: "Surveillance continue" },
]

// Testimonials were removed on purpose: they were attributed to invented people
// with invented claims ("alerts are 100% reliable", "latency of a few seconds").
// Fabricated reviews are unlawful in the EU and the latency claims were false.
// Do not reintroduce testimonials unless they come from real, consenting users.

export const faqs = [
  {
    q: "Comment fonctionne l’analyse ?",
    a: "Le carton rouge est le déclencheur. Dès qu’il est détecté, RedMatch récupère le contexte du match, puis RedMatch calcule l’indice de confiance du carton et vous envoie une analyse claire dans Telegram : probabilité de but supplémentaire, probabilité de victoire du favori et indice de confiance sur 100.",
  },
  {
    q: "RedMatch donne-t-il des conseils de pari ?",
    a: "Non, jamais. RedMatch n’est pas un service de pronostics ni de paris sportifs. Il fournit uniquement une analyse en temps réel de l’effet potentiel d’un carton rouge sur le match.",
  },
  {
    q: "Quelles compétitions sont analysées ?",
    a: "Plus de 20 compétitions européennes majeures : Premier League, Ligue 1, LaLiga, Serie A, Bundesliga, Liga Portugal, leurs divisions secondaires, ainsi que la Champions League, l’Europa League, la Conference League et les principales coupes nationales.",
  },
  {
    q: "Vais-je voir des statistiques complexes comme les xG ?",
    a: "Non. L’objectif est une lecture simple et immédiate. Vous recevez uniquement l’essentiel : les deux probabilités clés et l’indice de confiance, sans jargon ni tableaux illisibles.",
  },
]

export const pricingFeatures = [
  "Notifications illimitées",
  "Connexion Telegram",
  "Toutes les compétitions disponibles",
  "Infrastructure temps réel",
  "Support prioritaire",
]

export type PricingPlan = {
  id: string
  name: string
  price: string
  period: string
  tagline: string
  description?: string
  badge?: string
  features: string[]
  cta: string
  href: string
  highlight: boolean
  /**
   * Stripe Payment Link for this plan. Access is never granted from this URL:
   * entitlement only comes from the signed Stripe webhook (spec section 3).
   */
  checkoutUrl: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Abonnement Mensuel",
    price: "10 €",
    period: "/ mois",
    tagline: "3 jours gratuits, puis 10 € par mois sans engagement.",
    features: [
      "Analyses IA illimitées",
      "Notifications Telegram instantanées",
      "Toutes les compétitions disponibles",
      "Dashboard en temps réel",
      "Toutes les mises à jour",
    ],
    cta: "Commencer maintenant",
    href: "/checkout?plan=monthly",
    highlight: false,
  // Payment Link Stripe : 3 jours d’essai gratuit, puis 10 €/mois.
  checkoutUrl: "https://buy.stripe.com/14AdR95odbMrcdsf7i6EU03",
  },
  {
    id: "lifetime",
    name: "Offre Fondateur",
    price: "50 €",
    period: "Accès à vie",
    badge: "Le plus populaire",
    tagline: "Payez une seule fois, accès à vie.",
    description:
      "Payez une seule fois et profitez d’un accès à vie à RedMatch ainsi qu’à toutes les futures mises à jour.",
    features: [
      "Accès à vie",
      "Analyses IA illimitées",
      "Notifications Telegram illimitées",
      "Toutes les compétitions",
      "Toutes les futures fonctionnalités incluses",
      "Badge exclusif « Membre Fondateur »",
    ],
    cta: "Obtenir l’accès à vie",
    href: "/checkout?plan=lifetime",
    highlight: true,
    // Les deux Payment Links étaient inversés : celui-ci est bien le checkout 50 € à vie.
    checkoutUrl: "https://buy.stripe.com/cNi4gz9Et3fV0uK0co6EU01",
  },
]

// --- Live simulation helpers -------------------------------------------------
// The red card is only the trigger. For every detected card, RedMatch's AI
// copilot produces a simple, readable impact analysis. These values are
// simulated but structured so a real model/API response can be swapped in.

export type Analysis = {
  /** Team that RedMatch favours to win after the card (numerical advantage). */
  favorite: string
  /** Probability (%) of at least one more goal before the final whistle. */
  extraGoalProb: number
  /** Probability (%) that the favoured team wins the match. */
  favoriteWinProb: number
  /** Overall impact score of the red card on the match, out of 100. */
  impact: number
}

export type MatchEvent = {
  id: string
  competitionId: string
  competition: string
  home: string
  away: string
  minute: number
  score: string
  /** Player sent off. */
  player: string
  /** Team that received the red card. */
  team: string
  status: "analyzing" | "sending" | "sent"
  analysis: Analysis
}

/**
 * Flag emoji per competition country, so the demo notification can mirror the
 * real Telegram alert format (🇵🇹 Liga Portugal 2, etc.). Looked up by the
 * competition's `country` field; falls back to a neutral globe.
 */
const COUNTRY_FLAGS: Record<string, string> = {
  Angleterre: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Espagne: "🇪🇸",
  Italie: "🇮🇹",
  Allemagne: "🇩🇪",
  Portugal: "🇵🇹",
  "Pays-Bas": "🇳🇱",
  Turquie: "🇹🇷",
  Belgique: "🇧🇪",
  Suisse: "🇨🇭",
  "Arabie saoudite": "🇸🇦",
  Europe: "🇪🇺",
}

export function flagForCompetition(competitionId: string): string {
  const country = competitions.find((c) => c.id === competitionId)?.country
  return (country && COUNTRY_FLAGS[country]) || "🌍"
}

/**
 * Short, human AI reading of the red card's impact — the "🤖 Lecture IA"
 * paragraph of the real Telegram alert. Simulated but structured so a real
 * model response can be swapped in without touching the UI.
 */
export function buildAiReading(
  event: {
    player: string
    team: string
    minute: number
    analysis: Analysis
  },
  locale: "fr" | "en" = "fr",
): string {
  const { player, team, minute, analysis } = event
  const late = minute >= 70
  if (locale === "en") {
    return (
      `${player}'s dismissal leaves ${team} a man down ` +
      `${late ? "late in the game" : "with time still to play"}. ` +
      `This strengthens ${analysis.favorite}'s position ` +
      `(${analysis.favoriteWinProb}% win probability), with a ` +
      `${analysis.extraGoalProb >= 60 ? "high" : "moderate"} chance of another goal.`
    )
  }
  return (
    `L'expulsion de ${player} laisse ${team} en infériorité numérique ` +
    `${late ? "en fin de match" : "avec encore du temps à jouer"}. ` +
    `Cette situation renforce la position de ${analysis.favorite} ` +
    `(${analysis.favoriteWinProb}% de victoire), avec une opportunité ` +
    `${analysis.extraGoalProb >= 60 ? "élevée" : "modérée"} d'inscrire un autre but.`
  )
}

const fixtures: { competitionId: string; competition: string; home: string; away: string; players: string[] }[] = [
  { competitionId: "premier-league", competition: "Premier League", home: "Liverpool", away: "Arsenal", players: ["Van Dijk", "Saliba", "Rice"] },
  { competitionId: "ligue-1", competition: "Ligue 1", home: "PSG", away: "Marseille", players: ["Marquinhos", "Rongier", "Hakimi"] },
  { competitionId: "laliga", competition: "LaLiga", home: "Real Madrid", away: "Barcelone", players: ["Carvajal", "Araujo", "Rüdiger"] },
  { competitionId: "serie-a", competition: "Serie A", home: "Inter", away: "Juventus", players: ["Bastoni", "Bremer", "Barella"] },
  { competitionId: "bundesliga", competition: "Bundesliga", home: "Bayern", away: "Dortmund", players: ["Kimmich", "Hummels", "Upamecano"] },
  { competitionId: "champions-league", competition: "Champions League", home: "Man City", away: "Real Madrid", players: ["Rodri", "Dias", "Valverde"] },
  { competitionId: "liga-portugal", competition: "Liga Portugal", home: "Benfica", away: "Porto", players: ["Otamendi", "Pepe", "António Silva"] },
  { competitionId: "europa-league", competition: "Europa League", home: "Roma", away: "Leverkusen", players: ["Mancini", "Tah", "Cristante"] },
]

const clamp = (n: number, min = 5, max = 99) => Math.max(min, Math.min(max, Math.round(n)))

/**
 * Build a plausible impact analysis. The side that keeps 11 players (the
 * opponent of the carded team) becomes the favourite; probabilities rise with
 * the time remaining and the card's lateness weights the impact score.
 */
export function buildAnalysis(home: string, away: string, minute: number, score: string, team: string): Analysis {
  const favorite = team === home ? away : home
  const timeLeft = Math.max(0, 92 - minute)
  const rng = () => Math.random()
  const extraGoalProb = clamp(42 + timeLeft * 0.42 + rng() * 14)
  const favoriteWinProb = clamp(48 + timeLeft * 0.22 + rng() * 16)
  const impact = clamp(58 + (minute / 90) * 26 + rng() * 14, 40, 99)
  return { favorite, extraGoalProb, favoriteWinProb, impact }
}

export function makeRandomEvent(): MatchEvent {
  const f = fixtures[Math.floor(Math.random() * fixtures.length)]
  const minute = Math.floor(Math.random() * 88) + 3
  const a = Math.floor(Math.random() * 3)
  const b = Math.floor(Math.random() * 3)
  const player = f.players[Math.floor(Math.random() * f.players.length)]
  const team = Math.random() > 0.5 ? f.home : f.away
  const score = `${a}-${b}`
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    competitionId: f.competitionId,
    competition: f.competition,
    home: f.home,
    away: f.away,
    minute,
    score,
    player,
    team,
    status: "sent",
    analysis: buildAnalysis(f.home, f.away, minute, score, team),
  }
}

// Seeds carry fixed analysis values so the initial server/client render match
// (no Math.random on first paint → no hydration mismatch).
export const seedEvents: MatchEvent[] = [
  {
    id: "seed-1", competitionId: "premier-league", competition: "Premier League",
    home: "Liverpool", away: "Arsenal", minute: 68, score: "1-1", player: "Saliba", team: "Arsenal",
    status: "sent", analysis: { favorite: "Liverpool", extraGoalProb: 81, favoriteWinProb: 64, impact: 89 },
  },
  {
    id: "seed-2", competitionId: "laliga", competition: "LaLiga",
    home: "Real Madrid", away: "Barcelone", minute: 74, score: "2-1", player: "Araujo", team: "Barcelone",
    status: "sent", analysis: { favorite: "Real Madrid", extraGoalProb: 68, favoriteWinProb: 79, impact: 84 },
  },
  {
    id: "seed-3", competitionId: "serie-a", competition: "Serie A",
    home: "Inter", away: "Juventus", minute: 55, score: "0-0", player: "Bremer", team: "Juventus",
    status: "sent", analysis: { favorite: "Inter", extraGoalProb: 74, favoriteWinProb: 61, impact: 77 },
  },
  {
    id: "seed-4", competitionId: "bundesliga", competition: "Bundesliga",
    home: "Bayern", away: "Dortmund", minute: 81, score: "3-2", player: "Hummels", team: "Dortmund",
    status: "sent", analysis: { favorite: "Bayern", extraGoalProb: 58, favoriteWinProb: 83, impact: 91 },
  },
]
