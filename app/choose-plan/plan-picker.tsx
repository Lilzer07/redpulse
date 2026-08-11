"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Flame, Loader2 } from "lucide-react"
import { pricingPlans, type PricingPlan } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"
import type { SubscriptionPlan } from "@/lib/user-data"
import { activatePlanWithoutPayment } from "./actions"

function PlanCard({
  plan,
  index,
  pending,
  onChoose,
}: {
  plan: PricingPlan
  index: number
  pending: SubscriptionPlan | null
  onChoose: (plan: SubscriptionPlan) => void
}) {
  const { t } = useI18n()
  const highlight = plan.highlight
  // Same translated copy as the landing page, so prices never drift apart.
  const copy = t.pricing.plans[plan.id as keyof typeof t.pricing.plans]
  const badge = "badge" in copy ? copy.badge : undefined
  const isPending = pending === plan.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
      className={[
        "relative flex w-full flex-col overflow-hidden rounded-[2rem] p-7",
        highlight
          ? "border-2 border-primary bg-gradient-to-b from-primary/[0.08] to-transparent shadow-2xl shadow-primary/20"
          : "border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent",
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
                : "border border-white/10 bg-white/5 text-muted-foreground",
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

        {/* Checkout is not live yet, so the paid path is disabled rather than
            pretending to charge. Replace with the Stripe checkout call. */}
        <button
          type="button"
          disabled
          className={[
            "mt-7 h-12 w-full cursor-not-allowed rounded-xl text-base font-semibold opacity-50",
            highlight
              ? "bg-primary text-primary-foreground"
              : "border border-white/15 bg-white/5 text-foreground",
          ].join(" ")}
        >
          {t.choosePlan.comingSoon}
        </button>

        {/* TEMPORARY — see app/choose-plan/actions.ts. Remove with Stripe. */}
        <button
          type="button"
          onClick={() => onChoose(plan.id as SubscriptionPlan)}
          disabled={pending !== null}
          className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium text-muted-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:text-foreground disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {t.choosePlan.continueWithoutPaying}
        </button>
      </div>
    </motion.div>
  )
}

export function PlanPicker() {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, setPending] = useState<SubscriptionPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleChoose(plan: SubscriptionPlan) {
    setPending(plan)
    setError(null)
    const result = await activatePlanWithoutPayment(plan)
    if (result.ok) {
      router.replace("/dashboard")
      return
    }
    setPending(null)
    setError(t.choosePlan.error)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        {pricingPlans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} pending={pending} onChoose={handleChoose} />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
