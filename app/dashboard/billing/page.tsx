"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CreditCard, Download } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { useI18n } from "@/lib/i18n/context"

export default function BillingPage() {
  const { t } = useI18n()
  const b = t.billing
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <Topbar title={b.title} subtitle={b.subtitle} />

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
                  {b.activeBadge}
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">{b.planName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{b.nextBilling}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  10 €<span className="text-base font-medium text-muted-foreground">{b.perMonth}</span>
                </p>
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {b.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Single, positive primary action — cancelling now lives in the page footer. */}
            <div className="mt-7">
              <button className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]">
                {b.changePayment}
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
            <h3 className="font-semibold text-foreground">{b.cardTitle}</h3>
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/8 bg-background/60 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium tabular-nums text-foreground">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">{b.cardExpiry}</p>
              </div>
            </div>
            <button className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              {b.updateCard}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">{b.secure}</p>
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
            <h3 className="font-semibold text-foreground">{b.historyTitle}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {b.payments.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.id}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  <Check className="h-3 w-3" />
                  {b.paid}
                </span>
                <span className="w-16 text-right font-medium tabular-nums text-foreground">{p.amount}</span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  aria-label={`${b.downloadInvoice} ${p.id}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/*
          Account-closing area: intentionally understated. It sits outside the cards,
          at the very end of the page, as small muted text rather than a red button.
        */}
        <div className="mt-4 border-t border-white/5 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {b.manageAccount}
          </p>

          <AnimatePresence initial={false} mode="wait">
            {confirming ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm font-medium text-foreground">{b.cancelConfirmTitle}</p>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                  {b.cancelConfirmBody}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => setConfirming(false)}
                    className="h-9 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.06]"
                  >
                    {b.cancelBack}
                  </button>
                  <button className="text-xs font-medium text-[var(--danger)]/80 underline underline-offset-4 transition-colors hover:text-[var(--danger)]">
                    {b.cancelConfirm}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setConfirming(true)}
                  className="mt-2 text-xs text-muted-foreground/70 underline underline-offset-4 transition-colors hover:text-muted-foreground"
                >
                  {b.cancelLink}
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground/50">{b.cancelHint}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
