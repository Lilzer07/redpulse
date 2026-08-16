"use client"

import { motion } from "framer-motion"
import { Check, Flame } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { pricingPlans, type PricingPlan } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"

function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { t } = useI18n()
  const highlight = plan.highlight
  // Translated copy per plan id; prices/hrefs stay in lib/data.ts.
  const copy = t.pricing.plans[plan.id as keyof typeof t.pricing.plans]
  const badge = "badge" in copy ? copy.badge : undefined
  const description = "description" in copy ? copy.description : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      className={[
        "relative flex w-full flex-col overflow-hidden rounded-[2rem] p-8",
        highlight
          ? "glow-green border-2 border-primary bg-gradient-to-b from-primary/[0.08] to-transparent shadow-2xl shadow-primary/20 lg:-my-4 lg:py-12"
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

        <div className="mt-6 flex items-end gap-2">
          <span className="text-5xl font-bold tracking-tight text-foreground">{plan.price}</span>
          <span className="pb-2 text-muted-foreground">{copy.period}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{copy.tagline}</p>

        {description && (
          <p className="mt-4 text-pretty text-sm leading-relaxed text-foreground/80">{description}</p>
        )}

        <ul className="mt-8 space-y-3">
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

        <ButtonLink
          href={plan.href}
          size="lg"
          className={[
            "mt-8 h-12 w-full rounded-xl text-base font-semibold",
            highlight
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
              : "border border-[rgb(var(--overlay)/0.15)] bg-[rgb(var(--overlay)/0.05)] text-foreground hover:bg-[rgb(var(--overlay)/0.1)]",
          ].join(" ")}
        >
          {copy.cta}
        </ButtonLink>
      </div>
    </motion.div>
  )
}

export function Pricing() {
  const { t } = useI18n()

  return (
    <section id="tarifs" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.pricing.eyebrow}</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.pricing.title}
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">{t.pricing.subtitle}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-8">
          {pricingPlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
