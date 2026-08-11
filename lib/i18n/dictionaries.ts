// All user-facing copy for RedPulse, in French and English.
// Components read strings from here through `useI18n()` so the whole site —
// landing page and dashboard — switches language from a single toggle.
// Structural data (icons, prices, hrefs, competition list) stays in lib/data.ts;
// arrays here are index-aligned with their counterparts there.

export type Locale = "fr" | "en"

const fr = {
  localeName: "Français",
  localeShort: "FR",

  nav: {
    links: [
      { href: "#fonctionnalites", label: "Fonctionnalités" },
      { href: "#fonctionnement", label: "Fonctionnement" },
      { href: "#demo", label: "Démo" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#faq", label: "FAQ" },
    ],
    login: "Connexion",
    start: "Commencer",
    menu: "Menu",
    home: "RedPulse accueil",
    language: "Langue",
  },

  hero: {
    badge: "Copilote IA football en temps réel",
    titleBefore: "Chaque carton rouge cache une",
    titleHighlight: "opportunité",
    titleAfter: ", notre IA la détecte.",
    paragraph:
      "Dès qu’un carton rouge tombe, RedPulse récupère le contexte du match, analyse la situation et vous envoie une notification Telegram : probabilité de but supplémentaire, victoire du favori et indice de confiance. En quelques secondes.",
    ctaPrimary: "Commencer",
    ctaSecondary: "Voir la démonstration",
    trust: ["Analyse < 2 s", "Indice de confiance /100", "20+ compétitions"],
    imageAlt: "Stade de football illuminé la nuit",
  },

  phone: {
    botName: "RedPulse Bot",
    online: "en ligne",
    live: "live",
    redCard: "Carton rouge",
    aiAnalysis: "Analyse IA",
    extraGoal: "But supplémentaire",
    win: "Victoire",
    confidence: "Confiance",
    sent: "Envoyée",
  },

  marquee: {
    label: "Compétitions surveillées",
    title: "Plus de 20 compétitions surveillées en continu",
  },

  stats: {
    labels: [
      "Compétitions analysées",
      "Temps moyen d’analyse",
      "Disponibilité",
      "Surveillance IA",
    ],
  },

  features: {
    eyebrow: "Fonctionnalités",
    title: "Le carton rouge déclenche, l’IA analyse",
    subtitle:
      "Bien plus qu’une alerte : un copilote qui mesure l’indice de confiance de chaque carton, en temps réel.",
    items: [
      {
        title: "Analyse IA instantanée",
        description:
          "Dès qu’un carton rouge tombe, l’IA analyse le contexte du match et en calcule l’indice de confiance.",
      },
      {
        title: "Indice de confiance sur 100",
        description:
          "Une lecture immédiate de l’importance du carton sur l’issue du match, en un seul chiffre.",
      },
      {
        title: "Notification Telegram enrichie",
        description:
          "L’analyse complète arrive directement dans Telegram, quelques secondes après le carton.",
      },
      {
        title: "Probabilités simples",
        description:
          "But supplémentaire et victoire du favori, sans xG ni jargon : une lecture claire et rapide.",
      },
      {
        title: "Grandes compétitions",
        description: "Les championnats et coupes les plus importants d’Europe, surveillés en continu.",
      },
      {
        title: "Données en temps réel",
        description:
          "Le contexte du match est récupéré automatiquement à la détection du carton rouge.",
      },
    ],
  },

  how: {
    eyebrow: "Comment ça marche",
    title: "Opérationnel en quatre étapes",
    steps: [
      {
        title: "Carton rouge détecté",
        description: "Un carton rouge tombe : c’est le déclencheur. RedPulse le repère instantanément.",
      },
      {
        title: "Données récupérées",
        description: "Le contexte du match est collecté automatiquement : score, minute, équipes.",
      },
      {
        title: "L’IA analyse la situation",
        description: "Le copilote calcule l’indice de confiance et les probabilités clés du match.",
      },
      {
        title: "Telegram enrichi envoyé",
        description: "Vous recevez l’analyse complète dans Telegram en quelques secondes.",
      },
    ],
  },

  demo: {
    eyebrow: "Démonstration en direct",
    title: "Voyez l’IA analyser en temps réel",
    subtitle: "Chaque carton rouge déclenche une analyse instantanée, sans statistiques complexes.",
    liveTitle: "Analyses en direct",
    autoUpdate: "Mise à jour automatique",
    columns: {
      competition: "Compétition",
      match: "Match",
      redCard: "Carton rouge",
      extraGoal: "But +",
      favoriteWin: "Victoire favori",
      confidence: "Confiance",
    },
    disclaimer:
      "RedPulse fournit une analyse en temps réel. Ce n’est pas un service de pronostics ni de paris sportifs.",
  },

  pricing: {
    eyebrow: "Tarification",
    title: "Choisissez votre accès à RedPulse.",
    subtitle: "Un abonnement flexible pour découvrir, ou un accès à vie pour les premiers membres.",
    plans: {
      monthly: {
        name: "Abonnement Mensuel",
        period: "/ mois",
        tagline: "Idéal pour découvrir RedPulse.",
        features: [
          "Analyses IA illimitées",
          "Notifications Telegram instantanées",
          "Toutes les compétitions disponibles",
          "Dashboard en temps réel",
          "Toutes les mises à jour",
        ],
        cta: "Commencer maintenant",
      },
      lifetime: {
        name: "Offre Fondateur",
        period: "Accès à vie",
        badge: "Le plus populaire",
        tagline: "Payez une seule fois, accès à vie.",
        description:
          "Payez une seule fois et profitez d’un accès à vie à RedPulse ainsi qu’à toutes les futures mises à jour.",
        features: [
          "Accès à vie",
          "Analyses IA illimitées",
          "Notifications Telegram illimitées",
          "Toutes les compétitions",
          "Toutes les futures fonctionnalités incluses",
          "Badge exclusif « Membre Fondateur »",
        ],
        cta: "Obtenir l’accès à vie",
      },
    },
  },

  testimonials: {
    eyebrow: "Avis clients",
    title: "Ils ne ratent plus rien",
    quotes: [
      "La notification arrive avant même que le ralenti passe à la télé. C’est bluffant de rapidité.",
      "Enfin un outil qui fait une seule chose, mais qui la fait parfaitement. Zéro configuration, ça marche.",
      "Je suis 6 championnats en même temps sans stress. Les alertes sont fiables à 100%.",
      "L’intégration Telegram a pris littéralement 30 secondes. Interface magnifique en plus.",
      "Rapide, fiable, discret. Exactement ce que je cherchais pour suivre la Serie A et la Ligue 1.",
      "10 € par mois largement rentabilisés. La latence est vraiment de quelques secondes, pas plus.",
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions fréquentes",
    items: [
      {
        q: "Comment fonctionne l’analyse IA ?",
        a: "Le carton rouge est le déclencheur. Dès qu’il est détecté, RedPulse récupère le contexte du match, puis l’IA calcule l’indice de confiance du carton et vous envoie une analyse claire dans Telegram : probabilité de but supplémentaire, probabilité de victoire du favori et indice de confiance sur 100.",
      },
      {
        q: "RedPulse donne-t-il des conseils de pari ?",
        a: "Non, jamais. RedPulse n’est pas un service de pronostics ni de paris sportifs. Il fournit uniquement une analyse en temps réel de l’effet potentiel d’un carton rouge sur le match.",
      },
      {
        q: "Quelles compétitions sont analysées ?",
        a: "Plus de 20 compétitions européennes majeures : Premier League, Ligue 1, LaLiga, Serie A, Bundesliga, Liga Portugal, leurs divisions secondaires, ainsi que la Champions League, l’Europa League, la Conference League et les principales coupes nationales.",
      },
      {
        q: "Vais-je voir des statistiques complexes comme les xG ?",
        a: "Non. L’objectif est une lecture simple et immédiate. Vous recevez uniquement l’essentiel : les deux probabilités clés et l’indice de confiance, sans jargon ni tableaux illisibles.",
      },
    ],
  },

  footer: {
    tagline: "La surveillance football en temps réel. Ne manquez plus jamais un carton rouge.",
    columns: [
      { title: "Produit", links: ["Fonctionnalités", "Compétitions", "Tarification", "Démonstration"] },
      { title: "Entreprise", links: ["À propos", "Blog", "Carrières", "Contact"] },
      { title: "Légal", links: ["Confidentialité", "Conditions", "Cookies", "Mentions légales"] },
    ],
    rights: "© 2026 RedPulse. Tous droits réservés.",
    notBetting: "Outil de surveillance football en temps réel — pas un service de paris.",
  },

  countries: {
    Angleterre: "Angleterre",
    France: "France",
    Espagne: "Espagne",
    Italie: "Italie",
    Allemagne: "Allemagne",
    Portugal: "Portugal",
    Europe: "Europe",
  } as Record<string, string>,

  sidebar: {
    items: [
      "Dashboard",
      "Flux en direct",
      "Compétitions",
      "Telegram",
      "Facturation",
      "Paramètres",
    ],
    mobileItems: ["Accueil", "Direct", "Compét.", "Telegram", "Facture"],
    systemOk: "Système opérationnel",
    watching: "Surveillance active sur 22 compétitions.",
  },

  topbar: {
    search: "Rechercher",
    notifications: "Notifications",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "Votre copilote analyse les cartons rouges en direct.",
    stats: {
      matches: { label: "Matchs surveillés", hint: "En direct maintenant" },
      analyses: { label: "Analyses IA aujourd’hui", hint: "+3 vs hier" },
      confidence: { label: "Indice de confiance moyen", hint: "Sur les cartons du jour" },
      avgTime: { label: "Temps moyen d’analyse", value: "1,4 s", hint: "Détection → Telegram" },
      telegram: { label: "Statut Telegram", value: "Connecté", hint: "@redpulse_bot" },
    },
    liveTitle: "Analyses en direct",
    seeAll: "Tout voir",
  },

  feed: {
    analyzing: "Analyse IA…",
    sent: "Envoyée",
    computing: "Le copilote calcule l’indice de confiance…",
    extraGoal: "But supplémentaire",
    win: "Victoire",
    confidence: "Indice de confiance",
  },

  live: {
    title: "Analyses en direct",
    subtitle: "Chaque carton rouge déclenche une analyse IA, affichée ici en temps réel.",
  },

  competitions: {
    title: "Compétitions",
    subtitle: "Activez ou désactivez les alertes pour chaque compétition.",
    search: "Rechercher une compétition",
    active: "actives",
    enableAll: "Tout activer",
    disableAll: "Tout désactiver",
    alertsFor: "Alertes",
    tiers: {
      league: "Championnats",
      cup: "Coupes nationales",
      european: "Compétitions européennes",
    },
  },

  telegram: {
    title: "Telegram",
    subtitle: "Connectez votre bot pour recevoir les alertes.",
    configTitle: "Configuration du bot",
    configSubtitle: "Collez les identifiants fournis par @BotFather.",
    tokenLabel: "Token du bot Telegram",
    chatIdLabel: "Chat ID",
    testing: "Test en cours…",
    test: "Tester la connexion",
    success: "Telegram connecté avec succès.",
    helpTitle: "Comment obtenir vos identifiants",
    helpSteps: [
      "Ouvrez Telegram et démarrez une conversation avec @BotFather.",
      "Envoyez /newbot puis suivez les instructions pour créer votre bot.",
      "Copiez le token fourni et collez-le dans le champ à gauche.",
      "Récupérez votre Chat ID via @userinfobot et collez-le également.",
    ],
  },

  billing: {
    title: "Facturation",
    subtitle: "Gérez votre abonnement et vos moyens de paiement.",
    activeBadge: "Abonnement actif",
    planName: "RedPulse Premium",
    nextBilling: "Prochaine facturation le 1 juillet 2026",
    perMonth: "/mois",
    features: [
      "Notifications illimitées",
      "Connexion Telegram",
      "Toutes les compétitions disponibles",
      "Infrastructure temps réel",
      "Support prioritaire",
    ],
    changePayment: "Modifier le moyen de paiement",
    cardTitle: "Carte bancaire",
    cardExpiry: "Visa · expire 08/28",
    updateCard: "Mettre à jour la carte",
    secure: "Paiements sécurisés traités par Stripe.",
    historyTitle: "Historique des paiements",
    paid: "Payé",
    downloadInvoice: "Télécharger la facture",
    payments: [
      { id: "INV-2026-006", date: "1 juin 2026", amount: "10,00 €" },
      { id: "INV-2026-005", date: "1 mai 2026", amount: "10,00 €" },
      { id: "INV-2026-004", date: "1 avril 2026", amount: "10,00 €" },
      { id: "INV-2026-003", date: "1 mars 2026", amount: "10,00 €" },
    ],
    // Deliberately low-key wording for the account-closing area.
    manageAccount: "Gestion du compte",
    cancelLink: "Résilier l’abonnement",
    cancelHint: "Votre accès reste actif jusqu’à la fin de la période en cours.",
    cancelConfirmTitle: "Confirmer la résiliation ?",
    cancelConfirmBody:
      "Vos analyses et notifications Telegram s’arrêteront à la fin de la période déjà payée.",
    cancelConfirm: "Oui, résilier",
    cancelBack: "Annuler",
  },

  settings: {
    title: "Paramètres",
    subtitle: "Gérez votre profil et vos préférences.",
    profile: { title: "Profil", description: "Vos informations personnelles." },
    name: "Nom",
    email: "Adresse e-mail",
    password: "Mot de passe",
    regional: { title: "Préférences régionales", description: "Langue et fuseau horaire." },
    language: "Langue",
    timezone: "Fuseau horaire",
    notifications: {
      title: "Préférences des notifications",
      description: "Choisissez ce que vous recevez.",
      items: [
        { label: "Alertes instantanées", desc: "Notification dès qu’un carton rouge est distribué." },
        { label: "Résumé quotidien", desc: "Un récapitulatif des cartons du jour à 22h." },
        { label: "Nouveautés produit", desc: "Nouvelles compétitions et fonctionnalités." },
      ],
    },
    appearance: { title: "Apparence" },
    darkMode: "Mode sombre",
    darkModeDesc: "RedPulse est optimisé pour le mode sombre.",
    cancel: "Annuler",
    save: "Enregistrer les modifications",
  },
  auth: {
    loginTitle: "Content de vous revoir",
    loginSubtitle: "Connectez-vous pour accéder à vos alertes.",
    signUpTitle: "Créer un compte",
    signUpSubtitle: "Recevez vos premières alertes en moins de deux minutes.",
    email: "Adresse e-mail",
    emailPlaceholder: "vous@exemple.com",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion…",
    signUp: "Créer mon compte",
    signingUp: "Création…",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Vous avez déjà un compte ?",
    createOne: "Inscrivez-vous",
    signInLink: "Connectez-vous",
    signOut: "Déconnexion",
    backHome: "Retour à l'accueil",
    passwordMinHint: "8 caractères minimum.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    invalidCredentials: "E-mail ou mot de passe incorrect.",
    emailNotConfirmed: "Confirmez votre adresse e-mail avant de vous connecter.",
    rateLimited: "Trop de tentatives. Réessayez dans quelques minutes.",
    unexpectedError: "Une erreur inattendue est survenue. Réessayez.",
    checkEmailTitle: "Vérifiez votre boîte mail",
    checkEmailBody:
      "Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte, puis connectez-vous.",
    errorTitle: "Lien invalide ou expiré",
    errorBody: "Ce lien de confirmation n'est plus valable. Demandez-en un nouveau en vous inscrivant à nouveau.",
    goToLogin: "Aller à la connexion",
  },
}

const en: typeof fr = {
  localeName: "English",
  localeShort: "EN",

  nav: {
    links: [
      { href: "#fonctionnalites", label: "Features" },
      { href: "#fonctionnement", label: "How it works" },
      { href: "#demo", label: "Demo" },
      { href: "#tarifs", label: "Pricing" },
      { href: "#faq", label: "FAQ" },
    ],
    login: "Log in",
    start: "Get started",
    menu: "Menu",
    home: "RedPulse home",
    language: "Language",
  },

  hero: {
    badge: "Real-time football AI copilot",
    titleBefore: "Every red card hides an",
    titleHighlight: "opportunity",
    titleAfter: " — our AI spots it.",
    paragraph:
      "The moment a red card is shown, RedPulse pulls the match context, analyses the situation and sends you a Telegram notification: chance of another goal, favourite’s win probability and a confidence score. In seconds.",
    ctaPrimary: "Get started",
    ctaSecondary: "Watch the demo",
    trust: ["Analysis in < 2 s", "Confidence score /100", "20+ competitions"],
    imageAlt: "Football stadium lit up at night",
  },

  phone: {
    botName: "RedPulse Bot",
    online: "online",
    live: "live",
    redCard: "Red card",
    aiAnalysis: "AI analysis",
    extraGoal: "Another goal",
    win: "Win",
    confidence: "Confidence",
    sent: "Sent",
  },

  marquee: {
    label: "Monitored competitions",
    title: "Over 20 competitions monitored around the clock",
  },

  stats: {
    labels: ["Competitions analysed", "Average analysis time", "Uptime", "AI monitoring"],
  },

  features: {
    eyebrow: "Features",
    title: "The red card triggers, the AI analyses",
    subtitle:
      "Far more than an alert: a copilot that measures the confidence score of every card, in real time.",
    items: [
      {
        title: "Instant AI analysis",
        description:
          "As soon as a red card is shown, the AI reads the match context and computes its confidence score.",
      },
      {
        title: "Confidence score out of 100",
        description: "An immediate read on how much the card matters to the result — in a single number.",
      },
      {
        title: "Rich Telegram notification",
        description: "The full analysis lands straight in Telegram, seconds after the card.",
      },
      {
        title: "Simple probabilities",
        description:
          "Another goal and the favourite’s win — no xG, no jargon: a clear, fast read.",
      },
      {
        title: "Major competitions",
        description: "Europe’s most important leagues and cups, monitored continuously.",
      },
      {
        title: "Real-time data",
        description: "Match context is fetched automatically the instant a red card is detected.",
      },
    ],
  },

  how: {
    eyebrow: "How it works",
    title: "Up and running in four steps",
    steps: [
      {
        title: "Red card detected",
        description: "A red card is shown — that’s the trigger. RedPulse picks it up instantly.",
      },
      {
        title: "Data collected",
        description: "Match context is gathered automatically: score, minute, teams.",
      },
      {
        title: "The AI analyses",
        description: "The copilot computes the confidence score and the match’s key probabilities.",
      },
      {
        title: "Rich Telegram sent",
        description: "You receive the full analysis in Telegram within seconds.",
      },
    ],
  },

  demo: {
    eyebrow: "Live demo",
    title: "Watch the AI analyse in real time",
    subtitle: "Every red card triggers an instant analysis, with no complex statistics.",
    liveTitle: "Live analyses",
    autoUpdate: "Updates automatically",
    columns: {
      competition: "Competition",
      match: "Match",
      redCard: "Red card",
      extraGoal: "Goal +",
      favoriteWin: "Favourite win",
      confidence: "Confidence",
    },
    disclaimer:
      "RedPulse provides real-time analysis. It is not a tipping or sports-betting service.",
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Choose your access to RedPulse.",
    subtitle: "A flexible subscription to try it out, or lifetime access for early members.",
    plans: {
      monthly: {
        name: "Monthly plan",
        period: "/ month",
        tagline: "Perfect for discovering RedPulse.",
        features: [
          "Unlimited AI analyses",
          "Instant Telegram notifications",
          "All available competitions",
          "Real-time dashboard",
          "All updates included",
        ],
        cta: "Start now",
      },
      lifetime: {
        name: "Founder offer",
        period: "Lifetime access",
        badge: "Most popular",
        tagline: "Pay once, keep it for life.",
        description:
          "Pay once and enjoy lifetime access to RedPulse, including every future update.",
        features: [
          "Lifetime access",
          "Unlimited AI analyses",
          "Unlimited Telegram notifications",
          "All competitions",
          "All future features included",
          "Exclusive “Founding Member” badge",
        ],
        cta: "Get lifetime access",
      },
    },
  },

  testimonials: {
    eyebrow: "Customer reviews",
    title: "They never miss a thing",
    quotes: [
      "The notification arrives before the replay even airs on TV. The speed is stunning.",
      "Finally a tool that does one thing and does it perfectly. Zero setup, it just works.",
      "I follow 6 leagues at once without stress. The alerts are 100% reliable.",
      "The Telegram integration took literally 30 seconds. Gorgeous interface too.",
      "Fast, reliable, discreet. Exactly what I wanted for following Serie A and Ligue 1.",
      "€10 a month easily pays for itself. The latency really is a few seconds, no more.",
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        q: "How does the AI analysis work?",
        a: "The red card is the trigger. As soon as one is detected, RedPulse pulls the match context, then the AI computes the card’s confidence score and sends you a clear analysis in Telegram: the chance of another goal, the favourite’s win probability and a confidence score out of 100.",
      },
      {
        q: "Does RedPulse give betting advice?",
        a: "Never. RedPulse is not a tipping or sports-betting service. It only provides a real-time analysis of a red card’s potential effect on the match.",
      },
      {
        q: "Which competitions are analysed?",
        a: "More than 20 major European competitions: the Premier League, Ligue 1, LaLiga, Serie A, Bundesliga, Liga Portugal, their second divisions, plus the Champions League, Europa League, Conference League and the main domestic cups.",
      },
      {
        q: "Will I see complex stats like xG?",
        a: "No. The goal is a simple, immediate read. You only get the essentials: the two key probabilities and the confidence score — no jargon, no unreadable tables.",
      },
    ],
  },

  footer: {
    tagline: "Real-time football monitoring. Never miss a red card again.",
    columns: [
      { title: "Product", links: ["Features", "Competitions", "Pricing", "Demo"] },
      { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
      { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Legal notice"] },
    ],
    rights: "© 2026 RedPulse. All rights reserved.",
    notBetting: "A real-time football monitoring tool — not a betting service.",
  },

  countries: {
    Angleterre: "England",
    France: "France",
    Espagne: "Spain",
    Italie: "Italy",
    Allemagne: "Germany",
    Portugal: "Portugal",
    Europe: "Europe",
  },

  sidebar: {
    items: ["Dashboard", "Live feed", "Competitions", "Telegram", "Billing", "Settings"],
    mobileItems: ["Home", "Live", "Comps", "Telegram", "Billing"],
    systemOk: "All systems operational",
    watching: "Actively monitoring 22 competitions.",
  },

  topbar: {
    search: "Search",
    notifications: "Notifications",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "Your copilot is analysing red cards live.",
    stats: {
      matches: { label: "Matches monitored", hint: "Live right now" },
      analyses: { label: "AI analyses today", hint: "+3 vs yesterday" },
      confidence: { label: "Average confidence score", hint: "Across today’s cards" },
      avgTime: { label: "Average analysis time", value: "1.4 s", hint: "Detection → Telegram" },
      telegram: { label: "Telegram status", value: "Connected", hint: "@redpulse_bot" },
    },
    liveTitle: "Live analyses",
    seeAll: "See all",
  },

  feed: {
    analyzing: "AI analysing…",
    sent: "Sent",
    computing: "The copilot is computing the confidence score…",
    extraGoal: "Another goal",
    win: "Win",
    confidence: "Confidence score",
  },

  live: {
    title: "Live analyses",
    subtitle: "Every red card triggers an AI analysis, shown here in real time.",
  },

  competitions: {
    title: "Competitions",
    subtitle: "Turn alerts on or off for each competition.",
    search: "Search for a competition",
    active: "active",
    enableAll: "Enable all",
    disableAll: "Disable all",
    alertsFor: "Alerts",
    tiers: {
      league: "Leagues",
      cup: "Domestic cups",
      european: "European competitions",
    },
  },

  telegram: {
    title: "Telegram",
    subtitle: "Connect your bot to receive alerts.",
    configTitle: "Bot configuration",
    configSubtitle: "Paste the credentials provided by @BotFather.",
    tokenLabel: "Telegram bot token",
    chatIdLabel: "Chat ID",
    testing: "Testing…",
    test: "Test connection",
    success: "Telegram connected successfully.",
    helpTitle: "How to get your credentials",
    helpSteps: [
      "Open Telegram and start a chat with @BotFather.",
      "Send /newbot, then follow the instructions to create your bot.",
      "Copy the token you receive and paste it in the field on the left.",
      "Get your Chat ID from @userinfobot and paste it too.",
    ],
  },

  billing: {
    title: "Billing",
    subtitle: "Manage your subscription and payment methods.",
    activeBadge: "Active subscription",
    planName: "RedPulse Premium",
    nextBilling: "Next billing on 1 July 2026",
    perMonth: "/month",
    features: [
      "Unlimited notifications",
      "Telegram connection",
      "All available competitions",
      "Real-time infrastructure",
      "Priority support",
    ],
    changePayment: "Change payment method",
    cardTitle: "Payment card",
    cardExpiry: "Visa · expires 08/28",
    updateCard: "Update card",
    secure: "Secure payments processed by Stripe.",
    historyTitle: "Payment history",
    paid: "Paid",
    downloadInvoice: "Download invoice",
    payments: [
      { id: "INV-2026-006", date: "1 June 2026", amount: "€10.00" },
      { id: "INV-2026-005", date: "1 May 2026", amount: "€10.00" },
      { id: "INV-2026-004", date: "1 April 2026", amount: "€10.00" },
      { id: "INV-2026-003", date: "1 March 2026", amount: "€10.00" },
    ],
    manageAccount: "Account management",
    cancelLink: "Cancel subscription",
    cancelHint: "Your access stays active until the end of the current period.",
    cancelConfirmTitle: "Confirm cancellation?",
    cancelConfirmBody:
      "Your analyses and Telegram notifications will stop at the end of the period you already paid for.",
    cancelConfirm: "Yes, cancel",
    cancelBack: "Keep my plan",
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your profile and preferences.",
    profile: { title: "Profile", description: "Your personal information." },
    name: "Name",
    email: "Email address",
    password: "Password",
    regional: { title: "Regional preferences", description: "Language and time zone." },
    language: "Language",
    timezone: "Time zone",
    notifications: {
      title: "Notification preferences",
      description: "Choose what you receive.",
      items: [
        { label: "Instant alerts", desc: "A notification as soon as a red card is shown." },
        { label: "Daily digest", desc: "A recap of the day’s cards at 10pm." },
        { label: "Product news", desc: "New competitions and features." },
      ],
    },
    appearance: { title: "Appearance" },
    darkMode: "Dark mode",
    darkModeDesc: "RedPulse is optimised for dark mode.",
    cancel: "Cancel",
    save: "Save changes",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to access your alerts.",
    signUpTitle: "Create an account",
    signUpSubtitle: "Get your first alerts in under two minutes.",
    email: "Email address",
    emailPlaceholder: "you@example.com",
    password: "Password",
    confirmPassword: "Confirm password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    signUp: "Create my account",
    signingUp: "Creating…",
    noAccount: "No account yet?",
    hasAccount: "Already have an account?",
    createOne: "Sign up",
    signInLink: "Sign in",
    signOut: "Sign out",
    backHome: "Back to home",
    passwordMinHint: "8 characters minimum.",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    invalidCredentials: "Invalid email or password.",
    emailNotConfirmed: "Please confirm your email address before signing in.",
    rateLimited: "Too many attempts. Try again in a few minutes.",
    unexpectedError: "Something unexpected went wrong. Please try again.",
    checkEmailTitle: "Check your inbox",
    checkEmailBody:
      "We sent you a confirmation link. Click it to activate your account, then sign in.",
    errorTitle: "Invalid or expired link",
    errorBody: "This confirmation link is no longer valid. Request a new one by signing up again.",
    goToLogin: "Go to sign in",
  },
}

export type Dictionary = typeof fr

export const dictionaries: Record<Locale, Dictionary> = { fr, en }

export const locales: Locale[] = ["fr", "en"]
