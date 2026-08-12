"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ExternalLink, Loader2, AlertTriangle, Infinity as InfinityIcon } from "lucide-react"
import { openBillingPortal } from "@/app/dashboard/actions"
import type { Subscription } from "@/lib/user-data"

type Props = {
  subscription: Subscription | null
  /** True when the plan currently entitles the account to alerts. */
  active: boolean
  /** Localised feature bullets for the plan. */
  features: string[]
}

const PLAN_LABEL: Record<string, string> = {
  monthly: "RedMatch Mensuel",
  lifetime: "RedMatch À vie",
}

const PLAN_PRICE: Record<string, string> = {
  monthly: "10 €",
  lifetime: "50 €",
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return null
  return new Date(time).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

/**
 * Billing overview.
 *
 * Everything shown here comes from the subscription row that the Stripe webhook
 * writes. Card details and invoices are deliberately NOT rendered: Stripe owns
 * them, and a local copy would silently drift out of date. The portal button
 * hands the user to Stripe for those instead.
 */
export function BillingPanel({ subscription, active, features }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [error, setError] = useState("")

  async function openPortal() {
    setStatus("loading")
    setError("")
    const res = await openBillingPortal()
    if (res.ok) {
      window.location.href = res.url
      return
    }
    setError(
      res.error === "no_customer"
        ? "Aucun paiement récurrent à gérer pour ce compte."
        : "Le portail de facturation est momentanément indisponible.",
    )
    setStatus("error")
  }

  // No row at all: the account never completed a payment.
  if (!subscription) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-8">
        <h2 className="text-xl font-bold text-foreground">Aucun abonnement</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {"Ce compte n'a pas encore d'abonnement actif. Choisissez une offre pour recevoir les alertes."}
        </p>
        <a
          href="/choose-plan"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Voir les offres
        </a>
      </div>
    )
  }

  const isLifetime = subscription.plan === "lifetime"
  const renewal = formatDate(subscription.current_period_end)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.1] to-transparent p-6 lg:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              active ? "bg-primary/12 text-primary" : "bg-[var(--danger)]/12 text-[var(--danger)]"
            }`}
          >
            {active ? "Abonnement actif" : subscription.status === "pending" ? "Paiement en attente" : "Expiré"}
          </span>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            {PLAN_LABEL[subscription.plan] ?? subscription.plan}
          </h2>

          {/* State the actual consequence: a lifetime plan has no renewal date,
              so inventing one (or hiding the difference) would mislead. */}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {isLifetime ? (
              <>
                <InfinityIcon className="h-4 w-4" />
                Accès permanent, aucun renouvellement
              </>
            ) : renewal ? (
              active ? (
                `Prochain prélèvement le ${renewal}`
              ) : (
                `Expiré depuis le ${renewal}`
              )
            ) : (
              "Aucune date de renouvellement enregistrée"
            )}
          </p>
        </div>

        <p className="text-3xl font-bold text-foreground">
          {PLAN_PRICE[subscription.plan] ?? "—"}
          {!isLifetime && <span className="text-base font-medium text-muted-foreground">/mois</span>}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      {/* Only recurring plans have anything to manage in the portal. */}
      {isLifetime ? (
        <p className="mt-7 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {"Votre accès est définitif : il n'y a ni prélèvement à venir, ni abonnement à résilier."}
        </p>
      ) : (
        <div className="mt-7">
          <button
            onClick={openPortal}
            disabled={status === "loading"}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ouverture…
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Gérer mon abonnement
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Carte bancaire, factures et résiliation sont gérés directement par Stripe.
          </p>

          {status === "error" && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/[0.08] px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--danger)]" />
              <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
