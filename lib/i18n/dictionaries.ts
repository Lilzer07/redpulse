// All user-facing copy for RedMatch, in French and English.
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
    home: "RedMatch accueil",
    language: "Langue",
  },

  hero: {
    badge: "Copilote football en temps réel",
    titleBefore: "Chaque carton rouge cache une",
    titleHighlight: "opportunité",
    titleAfter: ", RedMatch la détecte.",
    paragraph:
      "Dès qu’un carton rouge tombe, RedMatch récupère le contexte du match, analyse la situation et vous envoie une notification Telegram : probabilité de but supplémentaire, victoire du favori et indice de confiance. En quelques secondes.",
    ctaPrimary: "Commencer l’essai gratuit de 3 jours",
      // Reflects MONITOR_CONFIG.intervalSeconds (60s). Keep this in step with the
    // real cadence: the earlier "Analyse < 2 s" was removed precisely because it
    // promised a latency the product did not deliver.
    trust: ["Vérification toutes les 60 s", "Indice de confiance /100", "26 compétitions"],
    imageAlt: "Stade de football illuminé la nuit",
  },

  phone: {
    botName: "RedMatch Bot",
    online: "en ligne",
    live: "live",
    redCardTitle: "CARTON ROUGE",
    redCard: "Carton rouge",
    player: "Joueur",
    expulsion: "Expulsion",
    analysisTitle: "Analyse RedMatch",
    aiAnalysis: "Analyse IA",
    aiReading: "Lecture IA",
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
    // Matched BY INDEX against `stats` in lib/data.ts — keep both in sync.
    labels: ["Compétitions couvertes", "Fréquence de vérification", "Surveillance continue"],
  },

  features: {
    eyebrow: "Fonctionnalités",
    title: "Le carton rouge se déclenche, RedMatch analyse",
    subtitle:
      "Bien plus qu’une alerte : un copilote qui mesure l’indice de confiance de chaque carton, en temps réel.",
    items: [
      {
        title: "Analyse instantanée",
        description:
          "Dès qu’un carton rouge tombe, RedMatch analyse le contexte du match et en calcule l’indice de confiance.",
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
        description: "Les championnats et coupes les plus suivis, en Europe et au-delà, surveillés en continu.",
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
        description: "Un carton rouge tombe : c’est le déclencheur. RedMatch le repère instantanément.",
      },
      {
        title: "Données récupérées",
        description: "Le contexte du match est collecté automatiquement : score, minute, équipes.",
      },
      {
        title: "Analyse de la situation",
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
    title: "Voyez RedMatch analyser en temps réel",
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
      "RedMatch fournit une analyse en temps réel. Ce n’est pas un service de pronostics ni de paris sportifs.",
  },

  pricing: {
    eyebrow: "Tarification",
    title: "Choisissez votre accès à RedMatch.",
    subtitle: "Un abonnement flexible pour découvrir, ou un accès à vie pour les premiers membres.",
    plans: {
      monthly: {
        name: "Abonnement Mensuel",
        period: "/ mois",
        tagline: "3 jours gratuits, puis 10 € par mois.",
        features: [
          "Analyses IA illimitées",
          "Notifications Telegram instantanées",
          "Toutes les compétitions disponibles",
          "Dashboard en temps réel",
          "Toutes les mises à jour",
        ],
        cta: "Commencer l’essai gratuit de 3 jours",
      },
      lifetime: {
        name: "Offre Fondateur",
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
      },
    },
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions fréquentes",
    items: [
      {
        q: "Comment fonctionne l’analyse IA ?",
        a: "Le carton rouge est le déclencheur. Dès qu’il est détecté, RedMatch récupère le contexte du match, puis l’IA calcule l’indice de confiance du carton et vous envoie une analyse claire dans Telegram : probabilité de but supplémentaire, probabilité de victoire du favori et indice de confiance sur 100.",
      },
      {
        q: "RedMatch donne-t-il des conseils de pari ?",
        a: "Non, jamais. RedMatch n’est pas un service de pronostics ni de paris sportifs. Il fournit uniquement une analyse en temps réel de l’effet potentiel d’un carton rouge sur le match.",
      },
      {
        q: "Quelles compétitions sont analysées ?",
        a: "Plus de 20 compétitions majeures : Premier League, Ligue 1, LaLiga, Serie A, Bundesliga, Liga Portugal, Eredivisie, Jupiler Pro League, Süper Lig, Saudi Pro League, les divisions secondaires des cinq grands championnats, ainsi que la Champions League, l’Europa League, la Conference League et les principales coupes nationales.",
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
      {
        title: "Produit",
        links: [
          { label: "Fonctionnalités", href: "#fonctionnalites" },
          { label: "Compétitions", href: "#competitions" },
          { label: "Tarification", href: "#tarifs" },
          { label: "Démonstration", href: "#demo" },
        ],
      },
      {
        title: "Entreprise",
        links: [
          { label: "Fonctionnement", href: "#fonctionnement" },
          { label: "FAQ", href: "#faq" },
          { label: "Contact", href: "mailto:redmatch.support@gmail.com" },
        ],
      },
      {
        title: "Légal",
        links: [
          { label: "Conditions", href: "/terms" },
          { label: "Confidentialité", href: "/terms" },
          { label: "Mentions légales", href: "/terms" },
        ],
      },
    ],
    rights: "© 2026 RedMatch. Tous droits réservés.",
    notBetting: "Outil de surveillance football en temps réel — pas un service de paris.",
    supportLabel: "Support",
    supportEmail: "redmatch.support@gmail.com",
  },

  whatsapp: {
    label: "Support WhatsApp",
    tagline: "Une question ? Écrivez-nous, on répond vite.",
    cta: "Discuter sur WhatsApp",
    open: "Ouvrir le support",
    close: "Fermer",
    prefill: "Bonjour, j'ai une question au sujet de RedMatch.",
  },

  countries: {
    Angleterre: "Angleterre",
    France: "France",
    Espagne: "Espagne",
    Italie: "Italie",
    Allemagne: "Allemagne",
    Portugal: "Portugal",
    "Pays-Bas": "Pays-Bas",
    Turquie: "Turquie",
    Belgique: "Belgique",
    "Arabie saoudite": "Arabie saoudite",
    Europe: "Europe",
  } as Record<string, string>,

  choosePlan: {
    eyebrow: "Dernière étape",
    title: "Choisissez votre abonnement.",
    subtitle: "Votre compte est créé. Sélectionnez une offre pour accéder à votre dashboard.",
    signedInAs: "Connecté en tant que",
  },

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
    watching: "Surveillance active sur 26 compétitions.",
  },

  topbar: {
    search: "Rechercher",
    notifications: "Notifications",
    account: "Mon compte",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "Votre copilote analyse les cartons rouges en direct.",
    stats: {
      alerts: { label: "Analyses reçues", hint: "Depuis la création du compte" },
      week: { label: "Ces 7 derniers jours", hint: "Analyses reçues" },
      confidence: { label: "Indice de confiance moyen", hint: "Sur vos analyses" },
      competitions: { label: "Compétitions suivies", hint: "Sélectionnées par vous" },
      telegram: {
        label: "Statut Telegram",
        connected: "Connecté",
        disconnected: "À configurer",
        hint: "Votre bot personnel",
      },
    },
    liveTitle: "Vos analyses",
    seeAll: "Tout voir",
    integration: {
      title: "Surveillance API-Football",
      reachable: "Connectée",
      unreachable: "Injoignable",
      notConfigured: "Clé non configurée",
      quota: "Requêtes consommées aujourd’hui",
      competitions: "Compétitions surveillées",
      lastCheck: "Dernière vérification",
      never: "Jamais",
      matchesWatched: "Matchs suivis au dernier passage",
      redCards: "Cartons rouges détectés",
    },
  },

  feed: {
    analyzing: "Analyse IA…",
    sent: "Envoyée",
    pending: "En attente",
    computing: "Le copilote calcule l’indice de confiance…",
    extraGoal: "But supplémentaire",
    win: "Victoire",
    confidence: "Indice de confiance",
    empty: {
      title: "Aucune analyse pour le moment",
      waiting:
        "Votre compte est prêt. Dès qu’un carton rouge tombe dans une compétition que vous suivez, l’analyse apparaîtra ici.",
      noCompetitions:
        "Vous ne suivez encore aucune compétition. Choisissez celles à surveiller pour commencer à recevoir des analyses.",
      pickCompetitions: "Choisir mes compétitions",
    },
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
    subtitle: "Liez votre compte, puis rejoignez le canal des alertes.",
    test: "Tester la connexion",
    // The "join the channel" step: linked but not yet a channel member.
    joinTitle: "Dernière étape : rejoindre le canal",
    joinSubtitle: "Vos alertes sont publiées dans un canal privé.",
    joinWarning: "Votre compte Telegram est bien lié, mais vous ne recevrez aucune alerte avant",
    joinWarningEmphasis: "d'avoir rejoint le canal",
    joinCta: "Rejoindre le canal RedMatch",
    joinRequest: "Obtenir mon lien d'invitation",
    joinLoading: "Génération…",
    joinHint:
      "Ouvrez le lien pour rejoindre le canal directement, sans demande d'adhésion. Lien strictement personnel, à usage unique, valable 15 minutes : ne le partagez pas, il ne fonctionne que depuis votre compte Telegram. Une fois dans le canal, cette page se mettra à jour.",
    joinErrorNoSub: "Votre abonnement n'est plus actif.",
    joinErrorUnlinked: "Votre compte Telegram n'est plus lié. Reconnectez-le.",
    joinErrorChannel: "Le canal n'est pas encore configuré côté serveur. Réessayez plus tard.",
    readyTitle: "Tout est prêt",
    readySubtitle: "Vous êtes dans le canal : les alertes y arrivent en temps réel.",
    readyBadge: "Compte lié et membre du canal.",
    helpTitle: "Bon à savoir",
    helpSteps: [
      "Aucun bot à créer et aucun token à saisir : RedMatch utilise son propre bot.",
      "Le lien de connexion est personnel et valable 15 minutes.",
      "Les alertes sont publiées dans un canal privé : vous devez le rejoindre pour les recevoir.",
      "Votre lien d'invitation est personnel et à usage unique : ne le partagez pas.",
      "Cliquer sur votre lien vous ajoute directement au canal : aucune demande d'adhésion, aucune validation manuelle. Il ne fonctionne que depuis votre compte Telegram.",
      "Commandes disponibles dans Telegram : /status et /stop.",
      "Vous pouvez déconnecter Telegram à tout moment depuis cette page.",
    ],
  },

  billing: {
    title: "Facturation",
    subtitle: "",
    locale: "fr-FR",
    noneTitle: "Aucun abonnement",
    noneBody: "Ce compte n'a pas encore d'abonnement actif. Choisissez une offre pour recevoir les alertes.",
    noneCta: "Voir les offres",
    statusActive: "Abonnement actif",
    statusPending: "Paiement en attente",
    statusExpired: "Expiré",
    planMonthly: "RedMatch Mensuel",
    planLifetime: "RedMatch À vie",
    perMonth: "/mois",
    lifetimeAccess: "Accès permanent, aucun renouvellement",
    nextCharge: "Prochain prélèvement le",
    expiredSince: "Expiré depuis le",
    noRenewalDate: "Aucune date de renouvellement enregistrée",
    lifetimeNote: "Votre accès est définitif : il n'y a ni prélèvement à venir, ni abonnement à résilier.",
    portalCta: "Gérer mon abonnement",
    portalLoading: "Ouverture…",
    portalNote: "Carte bancaire, factures et résiliation sont gérés directement par Stripe.",
    portalErrorNoCustomer: "Aucun paiement récurrent à gérer pour ce compte.",
    portalErrorUnavailable: "Le portail de facturation est momentanément indisponible.",
    features: [
      "Alertes carton rouge en temps réel",
      "Analyse chiffrée de chaque expulsion",
      "Lecture IA de la situation",
      "Toutes les compétitions disponibles",
    ],
  },

  settings: {
    title: "Paramètres",
    subtitle: "Gérez votre profil et vos préférences.",
    profile: { title: "Profil", description: "Vos informations personnelles." },
    name: "Nom",
    namePlaceholder: "Votre nom",
    email: "Adresse e-mail",
    password: "Mot de passe",
    passwordDesc: "Choisissez un nouveau mot de passe à tout moment.",
    changePassword: "Modifier le mot de passe",
    // In-place password change, directly in Settings.
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    passwordUpdating: "Mise à jour…",
    passwordUpdated: "Mot de passe mis à jour.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    passwordError: "Impossible de modifier le mot de passe. Réessayez.",
    passwordForgot: "Recevoir un lien par e-mail",
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
    appearance: { title: "Apparence", description: "Choisissez l’apparence de l’interface." },
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    systemMode: "Système",
    themeDesc: "Le changement s’applique immédiatement à toute l’application.",
    themeSystemHint: "« Système » suit le réglage de votre téléphone ou de votre ordinateur.",
    account: {
      title: "Compte",
      signedInAs: "Connecté en tant que",
      cancelSub: "Résilier mon abonnement",
      cancelConfirm: "Résilier maintenant ? L'accès au tableau de bord et au canal Telegram est coupé immédiatement.",
      cancelPending: "Résiliation…",
      cancelDone: "Abonnement résilié.",
      cancelError: "Résiliation impossible pour le moment.",
      cancelNone: "Aucun abonnement à résilier.",
      keep: "Garder mon abonnement",
    },
    cancel: "Annuler",
    save: "Enregistrer les modifications",
    saving: "Enregistrement…",
    saved: "Modifications enregistrées.",
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
    // Abbreviated to fit the six-tab mobile bar, like "Compét." and "Facture".
    signOutShort: "Sortie",
    backHome: "Retour à l'accueil",
    passwordMinHint: "8 caractères minimum.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    invalidCredentials: "E-mail ou mot de passe incorrect.",
    emailNotConfirmed: "Confirmez votre adresse e-mail avant de vous connecter.",
    rateLimited: "Trop de tentatives. Réessayez dans quelques minutes.",
    emailSendFailed:
      "Impossible d'envoyer l'e-mail de confirmation. Le service d'envoi (SMTP) n'est pas configuré correctement. Réessayez plus tard.",
    unexpectedError: "Une erreur inattendue est survenue. Réessayez.",
    confirmingTitle: "Confirmation en cours",
    confirmingBody: "Nous validons votre lien et ouvrons votre session.",
    confirmingWait: "Un instant…",
    checkEmailTitle: "Vérifiez votre boîte mail",
    checkEmailBody:
      "Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte, puis connectez-vous.",
    errorTitle: "Lien invalide ou expiré",
    errorBody: "Ce lien de confirmation n'est plus valable. Demandez-en un nouveau en vous inscrivant à nouveau.",
    errorBodyExpired:
      "Ce lien a expiré ou a déjà été utilisé. Si vous avez déjà confirmé votre adresse, connectez-vous simplement.",
    resendLink: "Recevoir un nouveau lien",
    goToLogin: "Aller à la connexion",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    forgotTitle: "Mot de passe oublié",
    forgotSubtitle:
      "Indiquez votre adresse e-mail : nous vous envoyons un lien pour définir un nouveau mot de passe.",
    sendResetLink: "Envoyer le lien",
    sending: "Envoi…",
    rememberedIt: "Vous vous en souvenez ?",
    resetSentTitle: "Lien envoyé",
    resetSentBody:
      "Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation dans quelques instants.",
    resetTitle: "Nouveau mot de passe",
    resetSubtitle: "Choisissez un nouveau mot de passe pour votre compte.",
    newPassword: "Nouveau mot de passe",
    updatePassword: "Mettre à jour le mot de passe",
    updating: "Mise à jour…",
    termsPrefix: "J'accepte les",
    termsLink: "conditions générales de RedMatch",
    termsSuffix: ".",
    termsRequired: "Vous devez accepter les conditions générales pour créer un compte.",
  },

  terms: {
    title: "Conditions générales d'utilisation",
    updated: "Dernière mise à jour : 11 août 2026",
    sections: [
      {
        heading: "1. Objet du service",
        body: "RedMatch est un outil de surveillance football en temps réel. Lorsqu'un carton rouge est détecté dans une compétition suivie, le service récupère le contexte du match, produit une analyse et vous l'envoie par notification Telegram. L'accès nécessite la création d'un compte.",
      },
      {
        heading: "2. Nature de l'analyse",
        body: "RedMatch n'est pas un service de pronostics ni de paris sportifs et ne fournit aucun conseil en investissement. Les probabilités et l'indice de confiance affichés sont des estimations statistiques fournies à titre informatif. Vous restez seul responsable des décisions que vous prenez à leur lecture.",
      },
      {
        heading: "3. Compte utilisateur",
        body: "Vous vous engagez à fournir une adresse e-mail valide et à préserver la confidentialité de votre mot de passe. Toute activité réalisée depuis votre compte vous est imputable. Pr��venez-nous sans délai si vous suspectez un accès non autorisé.",
      },
      {
        heading: "4. Abonnement et paiement",
        body: "L'accès est proposé par abonnement mensuel ou par achat unique donnant un accès à vie. L'abonnement mensuel se renouvelle automatiquement et peut être résilié à tout moment : l'accès reste alors actif jusqu'à la fin de la période déjà payée.",
      },
      {
        heading: "5. Disponibilité",
        body: "Nous mettons tout en œuvre pour assurer un service continu, sans pouvoir garantir une disponibilité ininterrompue. Les analyses dépendent de fournisseurs de données tiers : un retard, une interruption ou une donnée manquante venant de ces sources peut affecter les notifications.",
      },
      {
        heading: "6. Données personnelles",
        body: "Nous collectons uniquement les données nécessaires au fonctionnement du service : adresse e-mail, préférences de compétitions et paramètres Telegram. Ces informations ne sont ni vendues ni cédées à des tiers à des fins publicitaires. Vous pouvez demander la suppression de votre compte et des données associées à tout moment.",
      },
      {
        heading: "7. Utilisation acceptable",
        body: "Vous vous engagez à ne pas revendre, redistribuer ni exploiter automatiquement les analyses à grande échelle sans autorisation écrite, et à ne pas tenter de contourner les limitations techniques du service.",
      },
      {
        heading: "8. Évolution des conditions",
        body: "Ces conditions peuvent être modifiées afin de refléter les évolutions du service ou du cadre légal. En cas de changement significatif, vous serez informé par e-mail avant son entrée en vigueur.",
      },
    ],
    disclaimer:
      "RedMatch est un outil d'analyse et de surveillance. Le service ne constitue en aucun cas une incitation au pari ni une garantie de résultat.",
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
    home: "RedMatch home",
    language: "Language",
  },

  hero: {
    badge: "Real-time football copilot",
    titleBefore: "Every red card hides an",
    titleHighlight: "opportunity",
    titleAfter: ", RedMatch spots it.",
    paragraph:
      "The moment a red card is shown, RedMatch pulls the match context, analyses the situation and sends you a Telegram notification: chance of another goal, favourite’s win probability and a confidence score. In seconds.",
    ctaPrimary: "Start your 3-day free trial",
       trust: ["Checked every 60 s", "Confidence score /100", "26 competitions"],
    imageAlt: "Football stadium lit up at night",
  },

  phone: {
    botName: "RedMatch Bot",
    online: "online",
    live: "live",
    redCardTitle: "RED CARD",
    redCard: "Red card",
    player: "Player",
    expulsion: "Sent off",
    analysisTitle: "RedMatch analysis",
    aiAnalysis: "AI analysis",
    aiReading: "AI reading",
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
    labels: ["Competitions covered", "Check frequency", "Continuous monitoring"],
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
        description: "The most followed leagues and cups, in Europe and beyond, monitored continuously.",
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
        description: "A red card is shown — that’s the trigger. RedMatch picks it up instantly.",
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
      "RedMatch provides real-time analysis. It is not a tipping or sports-betting service.",
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Choose your access to RedMatch.",
    subtitle: "A flexible subscription to try it out, or lifetime access for early members.",
    plans: {
      monthly: {
        name: "Monthly plan",
        period: "/ month",
        tagline: "3 days free, then €10 per month.",
        features: [
          "Unlimited AI analyses",
          "Instant Telegram notifications",
          "All available competitions",
          "Real-time dashboard",
          "All updates included",
        ],
        cta: "Start your 3-day free trial",
      },
      lifetime: {
        name: "Founder offer",
        period: "Lifetime access",
        badge: "Most popular",
        tagline: "Pay once, keep it for life.",
        description:
          "Pay once and enjoy lifetime access to RedMatch, including every future update.",
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

  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        q: "How does the AI analysis work?",
        a: "The red card is the trigger. As soon as one is detected, RedMatch pulls the match context, then the AI computes the card’s confidence score and sends you a clear analysis in Telegram: the chance of another goal, the favourite’s win probability and a confidence score out of 100.",
      },
      {
        q: "Does RedMatch give betting advice?",
        a: "Never. RedMatch is not a tipping or sports-betting service. It only provides a real-time analysis of a red card’s potential effect on the match.",
      },
      {
        q: "Which competitions are analysed?",
        a: "More than 20 major competitions: the Premier League, Ligue 1, LaLiga, Serie A, Bundesliga, Liga Portugal, Eredivisie, Jupiler Pro League, Süper Lig, Saudi Pro League, the second divisions of the big five leagues, plus the Champions League, Europa League, Conference League and the main domestic cups.",
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
      {
        title: "Product",
        links: [
          { label: "Features", href: "#fonctionnalites" },
          { label: "Competitions", href: "#competitions" },
          { label: "Pricing", href: "#tarifs" },
          { label: "Demo", href: "#demo" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "How it works", href: "#fonctionnement" },
          { label: "FAQ", href: "#faq" },
          { label: "Contact", href: "mailto:redmatch.support@gmail.com" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms", href: "/terms" },
          { label: "Privacy", href: "/terms" },
          { label: "Legal notice", href: "/terms" },
        ],
      },
    ],
    rights: "© 2026 RedMatch. All rights reserved.",
    notBetting: "A real-time football monitoring tool — not a betting service.",
    supportLabel: "Support",
    supportEmail: "redmatch.support@gmail.com",
  },

  whatsapp: {
    label: "WhatsApp support",
    tagline: "A question? Message us, we reply fast.",
    cta: "Chat on WhatsApp",
    open: "Open support",
    close: "Close",
    prefill: "Hi, I have a question about RedMatch.",
  },

  countries: {
    Angleterre: "England",
    France: "France",
    Espagne: "Spain",
    Italie: "Italy",
    Allemagne: "Germany",
    Portugal: "Portugal",
    "Pays-Bas": "Netherlands",
    Turquie: "Turkey",
    Belgique: "Belgium",
    "Arabie saoudite": "Saudi Arabia",
    Europe: "Europe",
  },

  choosePlan: {
    eyebrow: "Last step",
    title: "Choose your plan.",
    subtitle: "Your account is ready. Pick a plan to unlock your dashboard.",
    signedInAs: "Signed in as",
  },

  sidebar: {
    items: ["Dashboard", "Live feed", "Competitions", "Telegram", "Billing", "Settings"],
    mobileItems: ["Home", "Live", "Comps", "Telegram", "Billing"],
    systemOk: "All systems operational",
    watching: "Actively monitoring 26 competitions.",
  },

  topbar: {
    search: "Search",
    notifications: "Notifications",
    account: "My account",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "Your copilot is analysing red cards live.",
    stats: {
      alerts: { label: "Analyses received", hint: "Since you signed up" },
      week: { label: "Last 7 days", hint: "Analyses received" },
      confidence: { label: "Average confidence score", hint: "Across your analyses" },
      competitions: { label: "Competitions followed", hint: "Chosen by you" },
      telegram: {
        label: "Telegram status",
        connected: "Connected",
        disconnected: "Needs setup",
        hint: "Your own bot",
      },
    },
    liveTitle: "Your analyses",
    seeAll: "See all",
    integration: {
      title: "API-Football monitoring",
      reachable: "Connected",
      unreachable: "Unreachable",
      notConfigured: "Key not configured",
      quota: "Requests used today",
      competitions: "Competitions monitored",
      lastCheck: "Last check",
      never: "Never",
      matchesWatched: "Matches watched on last pass",
      redCards: "Red cards detected",
    },
  },

  feed: {
    analyzing: "AI analysing…",
    sent: "Sent",
    pending: "Pending",
    computing: "The copilot is computing the confidence score…",
    extraGoal: "Another goal",
    win: "Win",
    confidence: "Confidence score",
    empty: {
      title: "No analyses yet",
      waiting:
        "Your account is ready. As soon as a red card happens in a competition you follow, the analysis will appear here.",
      noCompetitions:
        "You're not following any competition yet. Pick the ones to monitor to start receiving analyses.",
      pickCompetitions: "Choose my competitions",
    },
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
    subtitle: "Link your account, then join the alerts channel.",
    test: "Test connection",
    joinTitle: "Last step: join the channel",
    joinSubtitle: "Your alerts are posted in a private channel.",
    joinWarning: "Your Telegram account is linked, but you will not receive any alert until",
    joinWarningEmphasis: "you have joined the channel",
    joinCta: "Join the RedMatch channel",
    joinRequest: "Get my invite link",
    joinLoading: "Generating…",
    joinHint:
      "Open the link to join the channel directly, with no join request. Strictly personal, single-use link, valid for 15 minutes: do not share it, it only works from your own Telegram account. Once you are in the channel, this page will update.",
    joinErrorNoSub: "Your subscription is no longer active.",
    joinErrorUnlinked: "Your Telegram account is no longer linked. Reconnect it.",
    joinErrorChannel: "The channel is not configured on the server yet. Try again later.",
    readyTitle: "You are all set",
    readySubtitle: "You are in the channel: alerts arrive there in real time.",
    readyBadge: "Account linked and channel member.",
    helpTitle: "Good to know",
    helpSteps: [
      "No bot to create and no token to paste: RedMatch uses its own bot.",
      "Your connection link is personal and valid for 15 minutes.",
      "Alerts are posted in a private channel: you must join it to receive them.",
      "Your invite link is personal and single-use: do not share it.",
      "Tapping your link adds you to the channel directly: no join request, no manual approval. It only works from your own Telegram account.",
      "Available commands in Telegram: /status and /stop.",
      "You can disconnect Telegram at any time from this page.",
    ],
  },

  billing: {
    title: "Billing",
    subtitle: "",
    locale: "en-GB",
    noneTitle: "No subscription",
    noneBody: "This account has no active subscription yet. Pick a plan to start receiving alerts.",
    noneCta: "View plans",
    statusActive: "Active subscription",
    statusPending: "Payment pending",
    statusExpired: "Expired",
    planMonthly: "RedMatch Monthly",
    planLifetime: "RedMatch Lifetime",
    perMonth: "/month",
    lifetimeAccess: "Permanent access, no renewal",
    nextCharge: "Next charge on",
    expiredSince: "Expired since",
    noRenewalDate: "No renewal date on record",
    lifetimeNote: "Your access is permanent: there is no upcoming charge and nothing to cancel.",
    portalCta: "Manage my subscription",
    portalLoading: "Opening…",
    portalNote: "Card details, invoices and cancellation are handled directly by Stripe.",
    portalErrorNoCustomer: "There is no recurring payment to manage for this account.",
    portalErrorUnavailable: "The billing portal is temporarily unavailable.",
    features: [
      "Real-time red-card alerts",
      "Quantified analysis of every sending-off",
      "AI reading of the situation",
      "All available competitions",
    ],
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your profile and preferences.",
    profile: { title: "Profile", description: "Your personal information." },
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email address",
    password: "Password",
    passwordDesc: "Set a new password at any time.",
    changePassword: "Change password",
    // In-place password change, directly in Settings.
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordUpdating: "Updating…",
    passwordUpdated: "Password updated.",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordError: "Could not change the password. Please try again.",
    passwordForgot: "Email me a link instead",
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
    appearance: { title: "Appearance", description: "Choose how the interface looks." },
    darkMode: "Dark mode",
    lightMode: "Light mode",
    systemMode: "System",
    themeDesc: "The change applies immediately across the whole app.",
    themeSystemHint: "“System” follows your phone or computer setting.",
    account: {
      title: "Account",
      signedInAs: "Signed in as",
      cancelSub: "Cancel my subscription",
      cancelConfirm: "Cancel now? Dashboard and Telegram channel access are cut immediately.",
      cancelPending: "Cancelling…",
      cancelDone: "Subscription cancelled.",
      cancelError: "Couldn't cancel right now.",
      cancelNone: "No subscription to cancel.",
      keep: "Keep my subscription",
    },
    cancel: "Cancel",
    save: "Save changes",
    saving: "Saving…",
    saved: "Changes saved.",
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
    signOutShort: "Exit",
    backHome: "Back to home",
    passwordMinHint: "8 characters minimum.",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    invalidCredentials: "Invalid email or password.",
    emailNotConfirmed: "Please confirm your email address before signing in.",
    rateLimited: "Too many attempts. Try again in a few minutes.",
    emailSendFailed:
      "We couldn't send the confirmation email. The email service (SMTP) isn't configured correctly. Please try again later.",
    unexpectedError: "Something unexpected went wrong. Please try again.",
    confirmingTitle: "Confirming your account",
    confirmingBody: "We're validating your link and opening your session.",
    confirmingWait: "One moment…",
    checkEmailTitle: "Check your inbox",
    checkEmailBody:
      "We sent you a confirmation link. Click it to activate your account, then sign in.",
    errorTitle: "Invalid or expired link",
    errorBody: "This confirmation link is no longer valid. Request a new one by signing up again.",
    errorBodyExpired:
      "This link has expired or was already used. If you've already confirmed your address, just sign in.",
    resendLink: "Get a new link",
    goToLogin: "Go to sign in",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot password?",
    forgotTitle: "Forgot password",
    forgotSubtitle: "Enter your email address and we'll send you a link to set a new password.",
    sendResetLink: "Send the link",
    sending: "Sending…",
    rememberedIt: "Remembered it?",
    resetSentTitle: "Link sent",
    resetSentBody:
      "If an account exists for that address, you'll receive a reset link in a few moments.",
    resetTitle: "New password",
    resetSubtitle: "Choose a new password for your account.",
    newPassword: "New password",
    updatePassword: "Update password",
    updating: "Updating…",
    termsPrefix: "I accept the RedMatch",
    termsLink: "terms and conditions",
    termsSuffix: ".",
    termsRequired: "You must accept the terms and conditions to create an account.",
  },

  terms: {
    title: "Terms and conditions",
    updated: "Last updated: 11 August 2026",
    sections: [
      {
        heading: "1. What the service does",
        body: "RedMatch is a real-time football monitoring tool. When a red card is detected in a competition you follow, the service pulls the match context, produces an analysis and sends it to you as a Telegram notification. Access requires an account.",
      },
      {
        heading: "2. Nature of the analysis",
        body: "RedMatch is not a tipping or sports betting service and provides no investment advice. The probabilities and confidence score shown are statistical estimates provided for information only. You remain solely responsible for any decisions you make based on them.",
      },
      {
        heading: "3. Your account",
        body: "You agree to provide a valid email address and to keep your password confidential. Any activity carried out from your account is attributable to you. Tell us straight away if you suspect unauthorised access.",
      },
      {
        heading: "4. Subscription and payment",
        body: "Access is offered as a monthly subscription or as a one-off purchase granting lifetime access. The monthly subscription renews automatically and can be cancelled at any time: access then remains active until the end of the period already paid for.",
      },
      {
        heading: "5. Availability",
        body: "We do everything we can to keep the service running, without being able to guarantee uninterrupted availability. Analyses depend on third-party data providers: a delay, outage or missing data point from those sources can affect notifications.",
      },
      {
        heading: "6. Personal data",
        body: "We collect only the data needed to run the service: email address, competition preferences and Telegram settings. This information is never sold or passed to third parties for advertising purposes. You can request deletion of your account and its associated data at any time.",
      },
      {
        heading: "7. Acceptable use",
        body: "You agree not to resell, redistribute or automatically harvest the analyses at scale without written permission, and not to attempt to circumvent the service's technical limits.",
      },
      {
        heading: "8. Changes to these terms",
        body: "These terms may be updated to reflect changes to the service or to the legal framework. If a change is significant, you will be notified by email before it takes effect.",
      },
    ],
    disclaimer:
      "RedMatch is an analysis and monitoring tool. The service is in no way an encouragement to bet, nor a guarantee of any outcome.",
  },
}

export type Dictionary = typeof fr

export const dictionaries: Record<Locale, Dictionary> = { fr, en }

export const locales: Locale[] = ["fr", "en"]
