// Central data layer for RedPulse.
// Frontend-first: values are simulated but structured so real API/Supabase
// data can be swapped in without touching UI components.

export type Competition = {
  id: string
  name: string
  country: string
  tier: "league" | "cup" | "european"
  color: string
  abbr: string
}

export const competitions: Competition[] = [
  { id: "premier-league", name: "Premier League", country: "Angleterre", tier: "league", color: "#3D195B", abbr: "PL" },
  { id: "championship", name: "Championship", country: "Angleterre", tier: "league", color: "#1B458F", abbr: "CH" },
  { id: "ligue-1", name: "Ligue 1", country: "France", tier: "league", color: "#091C3E", abbr: "L1" },
  { id: "ligue-2", name: "Ligue 2", country: "France", tier: "league", color: "#0B3D91", abbr: "L2" },
  { id: "laliga", name: "LaLiga", country: "Espagne", tier: "league", color: "#E30613", abbr: "LL" },
  { id: "laliga-2", name: "LaLiga 2", country: "Espagne", tier: "league", color: "#00529F", abbr: "L2" },
  { id: "serie-a", name: "Serie A", country: "Italie", tier: "league", color: "#008FD7", abbr: "SA" },
  { id: "serie-b", name: "Serie B", country: "Italie", tier: "league", color: "#00A551", abbr: "SB" },
  { id: "bundesliga", name: "Bundesliga", country: "Allemagne", tier: "league", color: "#D20515", abbr: "BL" },
  { id: "2-bundesliga", name: "2. Bundesliga", country: "Allemagne", tier: "league", color: "#E30613", abbr: "B2" },
  { id: "liga-portugal", name: "Liga Portugal", country: "Portugal", tier: "league", color: "#006940", abbr: "LP" },
  { id: "liga-portugal-2", name: "Liga Portugal 2", country: "Portugal", tier: "league", color: "#00843D", abbr: "P2" },
  { id: "champions-league", name: "Champions League", country: "Europe", tier: "european", color: "#0B1B54", abbr: "UCL" },
  { id: "europa-league", name: "Europa League", country: "Europe", tier: "european", color: "#FF6900", abbr: "UEL" },
  { id: "conference-league", name: "Conference League", country: "Europe", tier: "european", color: "#00B54A", abbr: "UECL" },
  { id: "fa-cup", name: "FA Cup", country: "Angleterre", tier: "cup", color: "#C8102E", abbr: "FA" },
  { id: "coupe-de-france", name: "Coupe de France", country: "France", tier: "cup", color: "#002395", abbr: "CDF" },
  { id: "copa-del-rey", name: "Copa del Rey", country: "Espagne", tier: "cup", color: "#C60B1E", abbr: "CDR" },
  { id: "coppa-italia", name: "Coppa Italia", country: "Italie", tier: "cup", color: "#0066A1", abbr: "CI" },
  { id: "dfb-pokal", name: "DFB Pokal", country: "Allemagne", tier: "cup", color: "#000000", abbr: "DFB" },
  { id: "taca-de-portugal", name: "Taça de Portugal", country: "Portugal", tier: "cup", color: "#006600", abbr: "TDP" },
]

export type Feature = {
  icon: string
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: "zap",
    title: "Notifications instantanées",
    description:
      "Recevez un message Telegram quelques secondes après chaque carton rouge, où que vous soyez.",
  },
  {
    icon: "globe",
    title: "Grandes compétitions",
    description:
      "Les championnats et coupes les plus importants d’Europe, réunis au même endroit.",
  },
  {
    icon: "send",
    title: "Intégration Telegram",
    description:
      "Connectez votre compte Telegram en quelques secondes, sans configuration complexe.",
  },
  {
    icon: "sliders",
    title: "Filtres personnalisés",
    description:
      "Choisissez uniquement les compétitions qui vous intéressent réellement.",
  },
  {
    icon: "gauge",
    title: "Infrastructure rapide",
    description:
      "Serveurs optimisés et surveillance continue pour une latence minimale.",
  },
  {
    icon: "shield-check",
    title: "Paiement sécurisé",
    description: "Paiement géré par Stripe, avec le plus haut niveau de sécurité.",
  },
]

export const steps = [
  { step: "01", title: "Créer un compte", description: "Inscrivez-vous en moins d’une minute avec votre e-mail." },
  { step: "02", title: "Connecter Telegram", description: "Reliez votre bot Telegram en collant simplement votre token." },
  { step: "03", title: "Choisir vos compétitions", description: "Sélectionnez les championnats et coupes à surveiller." },
  { step: "04", title: "Recevoir les alertes", description: "Chaque carton rouge déclenche automatiquement une alerte." },
]

export const stats = [
  { value: 20, suffix: "+", label: "Compétitions" },
  { value: 2, prefix: "<", suffix: "s", label: "Temps moyen de notification" },
  { value: 99.99, suffix: "%", label: "Disponibilité", decimals: 2 },
  { value: 24, suffix: "h/24", label: "Surveillance" },
]

export type Testimonial = {
  name: string
  handle: string
  quote: string
  initials: string
}

export const testimonials: Testimonial[] = [
  {
    name: "Thomas Renard",
    handle: "@thomas_r",
    initials: "TR",
    quote:
      "La notification arrive avant même que le ralenti passe à la télé. C’est bluffant de rapidité.",
  },
  {
    name: "Léa Moreau",
    handle: "@lea.m",
    initials: "LM",
    quote:
      "Enfin un outil qui fait une seule chose, mais qui la fait parfaitement. Zéro configuration, ça marche.",
  },
  {
    name: "Karim Benali",
    handle: "@karimb",
    initials: "KB",
    quote:
      "Je suis 6 championnats en même temps sans stress. Les alertes sont fiables à 100%.",
  },
  {
    name: "Sophie Laurent",
    handle: "@sophiel",
    initials: "SL",
    quote:
      "L’intégration Telegram a pris littéralement 30 secondes. Interface magnifique en plus.",
  },
  {
    name: "Marco Rossi",
    handle: "@marco_rossi",
    initials: "MR",
    quote:
      "Rapide, fiable, discret. Exactement ce que je cherchais pour suivre la Serie A et la Ligue 1.",
  },
  {
    name: "Julien Fabre",
    handle: "@jfabre",
    initials: "JF",
    quote:
      "10 € par mois largement rentabilisés. La latence est vraiment de quelques secondes, pas plus.",
  },
]

export const faqs = [
  {
    q: "À quelle vitesse arrivent les notifications ?",
    a: "En moyenne moins de 2 secondes après la validation officielle du carton rouge. Notre infrastructure surveille les flux en continu pour minimiser la latence.",
  },
  {
    q: "Quelles compétitions sont surveillées ?",
    a: "Plus de 20 compétitions européennes majeures : Premier League, Ligue 1, LaLiga, Serie A, Bundesliga, Liga Portugal, leurs divisions secondaires, ainsi que la Champions League, l’Europa League, la Conference League et les principales coupes nationales.",
  },
  {
    q: "Puis-je choisir uniquement certaines compétitions ?",
    a: "Oui. Depuis votre tableau de bord, activez ou désactivez chaque compétition individuellement. Vous ne recevez que les alertes qui vous intéressent.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Bien sûr. L’abonnement est sans engagement et se résilie en un clic depuis la page Facturation. Vous conservez l’accès jusqu’à la fin de la période payée.",
  },
]

export const pricingFeatures = [
  "Notifications illimitées",
  "Connexion Telegram",
  "Toutes les compétitions disponibles",
  "Infrastructure temps réel",
  "Support prioritaire",
]

// --- Live simulation helpers -------------------------------------------------

export type MatchEvent = {
  id: string
  competitionId: string
  competition: string
  home: string
  away: string
  minute: number
  score: string
  player: string
  status: "sent" | "sending"
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

export function makeRandomEvent(): MatchEvent {
  const f = fixtures[Math.floor(Math.random() * fixtures.length)]
  const minute = Math.floor(Math.random() * 88) + 3
  const a = Math.floor(Math.random() * 3)
  const b = Math.floor(Math.random() * 3)
  const player = f.players[Math.floor(Math.random() * f.players.length)]
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    competitionId: f.competitionId,
    competition: f.competition,
    home: f.home,
    away: f.away,
    minute,
    score: `${a}-${b}`,
    player,
    status: "sent",
  }
}

export const seedEvents: MatchEvent[] = [
  { id: "seed-1", competitionId: "premier-league", competition: "Premier League", home: "Liverpool", away: "Arsenal", minute: 68, score: "1-1", player: "Saliba", status: "sent" },
  { id: "seed-2", competitionId: "laliga", competition: "LaLiga", home: "Real Madrid", away: "Barcelone", minute: 74, score: "2-1", player: "Araujo", status: "sent" },
  { id: "seed-3", competitionId: "serie-a", competition: "Serie A", home: "Inter", away: "Juventus", minute: 55, score: "0-0", player: "Bremer", status: "sent" },
  { id: "seed-4", competitionId: "bundesliga", competition: "Bundesliga", home: "Bayern", away: "Dortmund", minute: 81, score: "3-2", player: "Hummels", status: "sent" },
]
