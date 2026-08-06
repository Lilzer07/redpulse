"use client"

import { motion } from "framer-motion"
import { Check, CreditCard, Download } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { pricingFeatures } from "@/lib/data"

const payments = [
  { id: "INV-2026-006", date: "1 juin 2026", amount: "10,00 €", status: "Payé" },
  { id: "INV-2026-005", date: "1 mai 2026", amount: "10,00 €", status: "Payé" },
  { id: "INV-2026-004", date: "1 avril 2026", amount: "10,00 €", status: "Payé" },
  { id: "INV-2026-003", date: "1 mars 2026", amount: "10,00 €", status: "Payé" },
]

export default function BillingPage() {
  return (
    <>
      <Topbar title="Facturation" subtitle="Gérez votre abonnement et vos moyens de paiement." />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Current plan */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.1] to-transparent p-6 lg:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                  Abonnement actif
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">RedPulse Premium</h2>
                <p className="mt-1 text-sm text-muted-foreground">Prochaine facturation le 1 juillet 2026</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  10 €<span className="text-base font-medium text-muted-foreground">/mois</span>
                </p>
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {pricingFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]">
                Modifier le moyen de paiement
              </button>
              <button className="h-11 flex-1 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/[0.06] text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/[0.12]">
                Annuler l’abonnement
              </button>
            </div>
          </motion.div>

          {/* Payment method */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-7"
          >
            <h3 className="font-semibold text-foreground">Carte bancaire</h3>
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/8 bg-background/60 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium tabular-nums text-foreground">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Visa · expire 08/28</p>
              </div>
            </div>
            <button className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Mettre à jour la carte
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Paiements sécurisés traités par Stripe.
            </p>
          </motion.div>
        </div>

        {/* Payment history */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]"
        >
          <div className="border-b border-white/8 px-6 py-4">
            <h3 className="font-semibold text-foreground">Historique des paiements</h3>
          </div>
          <div className="divide-y divide-white/5">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.id}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  <Check className="h-3 w-3" />
                  {p.status}
                </span>
                <span className="w-16 text-right font-medium tabular-nums text-foreground">{p.amount}</span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  aria-label={`Télécharger la facture ${p.id}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}
