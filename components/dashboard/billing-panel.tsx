"use client"

import { motion } from "framer-motion"
import { Check, Infinity as InfinityIcon } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import type { Subscription } from "@/lib/user-data"

type Props = {
  subscription: Subscription | null
  /** True when the plan currently entitles the account to alerts. */
  active: boolean
}

const PLAN_PRICE: Record<string, string> = {
  monthly: "10 €",
  lifetime: "50 €",
}

function formatDate(value: string | null, locale: string): string | null {
  if (!value) return null
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return null
  return new Date(time).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
}

/**
 * Billing overview.
 *
 * Everything shown here comes from the subscription row that the Stripe webhook
 * writes. Card details and invoices are deliberately NOT rendered: Stripe owns
 * them, and a local copy would silently drift out of date.
 */
export function BillingPanel({ subscription, active }: Props) {
  const { t } = useI18n()
  const b = t.billing

  // No row at all: the account never completed a payment.
  if (!subscription) {
    return (
      <div className="rounded-3xl border border-[rgb(var(--overlay)/0.08)] bg-[rgb(var(--overlay)/0.02)] p-6 lg:p-8">
        <h2 className="text-xl font-bold text-foreground">{b.noneTitle}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{b.noneBody}</p>
        <a
          href="/choose-plan"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {b.noneCta}
        </a>
      </div>
    )
  }

  const isLifetime = subscription.plan === "lifetime"
  const renewal = formatDate(subscription.current_period_end, b.locale)

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
            {active ? b.statusActive : subscription.status === "pending" ? b.statusPending : b.statusExpired}
          </span>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            {isLifetime ? b.planLifetime : subscription.plan === "monthly" ? b.planMonthly : subscription.plan}
          </h2>

          {/* State the actual consequence: a lifetime plan has no renewal date,
              so inventing one (or hiding the difference) would mislead. */}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {isLifetime ? (
              <>
                <InfinityIcon className="h-4 w-4" />
                {b.lifetimeAccess}
              </>
            ) : renewal ? (
              `${active ? b.nextCharge : b.expiredSince} ${renewal}`
            ) : (
              b.noRenewalDate
            )}
          </p>
        </div>

        <p className="text-3xl font-bold text-foreground">
          {PLAN_PRICE[subscription.plan] ?? "—"}
          {!isLifetime && <span className="text-base font-medium text-muted-foreground">{b.perMonth}</span>}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {b.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      {/* Lifetime plans keep their informational note; recurring plans no longer
          expose a Stripe management button here. */}
      {isLifetime && (
        <p className="mt-7 rounded-xl border border-[rgb(var(--overlay)/0.08)] bg-[rgb(var(--overlay)/0.02)] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {b.lifetimeNote}
        </p>
      )}
    </motion.div>
  )
}
