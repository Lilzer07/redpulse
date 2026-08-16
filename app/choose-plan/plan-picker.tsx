"use client"

import { motion } from "framer-motion"
import { Check, Flame } from "lucide-react"
import { pricingPlans, type PricingPlan } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"

function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { t } = useI18n()
  const highlight = plan.highlight
  // Same translated copy as the landing page, so prices never drift apart.
  const copy = t.pricing.plans[plan.id as keyof typeof t.pricing.plans]
  const badge = "badge" in copy ? copy.badge : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
      className={[
        "relative flex w-full flex-col overflow-hidden rounded-[2rem] p-7",
        highlight
          ? "border-2 border-primary bg-gradient-to-b from-primary/[0.08] to-transparent shadow-2xl shadow-primary/20"
          : "border border-[rgb(var(--overlay)/0.1)] bg-gradient-to-b from-[rgb(var(--overlay)/0.04)] to-transparent",
      ].join(" ")}
    >
      {highlight && (
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/25 blur-3xl"
          aria-hidden
        />
      )}

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-medium",
              highlight
                ? "border border-primary/30 bg-primary/15 text-primary"
                : "border border-[rgb(var(--overlay)/0.1)] bg-[rgb(var(--overlay)/0.05)] text-muted-foreground",
            ].join(" ")}
          >
            {copy.name}
          </span>
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
              <Flame className="h-3.5 w-3.5" aria-hidden />
              {badge}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-end gap-2">
          <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{plan.price}</span>
          <span className="pb-2 text-muted-foreground">{copy.period}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{copy.tagline}</p>

        <ul className="mt-6 space-y-3">
          {copy.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-foreground">
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  highlight ? "bg-primary/25" : "bg-primary/15",
                ].join(" ")}
              >
                <Check className="h-3 w-3 text-primary" aria-hidden />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Live Stripe checkout: /checkout tags the payment link with the user's
            id, and access is granted only by the signed Stripe webhook. */}
        <a
          href={`/checkout?plan=${plan.id}`}
          className={[
            "mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold transition-colors",
            highlight
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
              : "border border-[rgb(var(--overlay)/0.15)] bg-[rgb(var(--overlay)/0.05)] text-foreground hover:bg-[rgb(var(--overlay)/0.1)]",
          ].join(" ")}
        >
          {copy.cta}
        </a>
      </div>
    </motion.div>
  )
}

export function PlanPicker() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        {pricingPlans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} />
        ))}
      </div>
    </div>
  )
}
