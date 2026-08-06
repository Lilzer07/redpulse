"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { pricingFeatures } from "@/lib/data"

export function Pricing() {
  return (
    <section id="tarifs" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Tarification</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Simple. Une offre, tout inclus.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Pas de paliers, pas de suppléments. Tout RedPulse pour un seul prix.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="glow-green relative mx-auto mt-14 max-w-md overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-b from-white/[0.04] to-transparent p-8"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Offre unique
            </span>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight text-foreground">10 €</span>
              <span className="pb-2 text-muted-foreground">/ mois</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Sans engagement, résiliable à tout moment.</p>

            <ul className="mt-8 space-y-3">
              {pricingFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" aria-hidden />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <ButtonLink
              href="/dashboard/billing"
              size="lg"
              className="mt-8 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              S’abonner
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
