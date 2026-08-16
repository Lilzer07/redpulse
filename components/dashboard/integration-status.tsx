"use client"

import { motion } from "framer-motion"
import { Activity, AlertTriangle, CheckCircle2, KeyRound } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export type IntegrationStatusView = {
  configured: boolean
  reachable: boolean
  requestsCurrent: number | null
  requestsLimit: number | null
  competitionsMonitored: number
  lastCheckedAt: string | null
  matchesWatched: number
  redCardsDetected: number
  error: string | null
}

/**
 * Shows the genuine state of the API-Football link.
 *
 * The three states are distinct on purpose: a missing key is a setup problem, an
 * unreachable API is an outage, and neither is allowed to render as "connected".
 */
export function IntegrationStatus({ status }: { status: IntegrationStatusView }) {
  const { t, locale } = useI18n()
  const s = t.dashboard.integration

  const state = !status.configured ? "unconfigured" : status.reachable ? "ok" : "error"
  const Icon = state === "ok" ? CheckCircle2 : state === "unconfigured" ? KeyRound : AlertTriangle
  const label = state === "ok" ? s.reachable : state === "unconfigured" ? s.notConfigured : s.unreachable

  // Green only when the API genuinely answered; amber otherwise.
  const tone =
    state === "ok"
      ? { text: "text-primary", bg: "bg-primary/12", border: "border-primary/25" }
      : { text: "text-[var(--danger)]", bg: "bg-[var(--danger)]/12", border: "border-[var(--danger)]/25" }

  const lastCheck = status.lastCheckedAt
    ? new Date(status.lastCheckedAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : s.never

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl border border-[rgb(var(--overlay)/0.08)] bg-[rgb(var(--overlay)/0.015)] p-5 lg:p-6"
      aria-label={s.title}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgb(var(--overlay)/0.04)] text-muted-foreground">
            <Activity className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tone.border} ${tone.bg} ${tone.text}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
        <Metric label={s.competitions} value={String(status.competitionsMonitored)} />
        <Metric
          label={s.quota}
          value={
            status.requestsCurrent === null
              ? "—"
              : status.requestsLimit === null
                ? String(status.requestsCurrent)
                : `${status.requestsCurrent}/${status.requestsLimit}`
          }
        />
        <Metric label={s.matchesWatched} value={String(status.matchesWatched)} />
        <Metric label={s.redCards} value={String(status.redCardsDetected)} />
      </dl>

      <p className="mt-5 border-t border-[rgb(var(--overlay)/0.08)] pt-4 text-xs text-muted-foreground">
        {s.lastCheck}: <span className="text-foreground/80">{lastCheck}</span>
      </p>

      {/* Surfaced verbatim so a misconfiguration is diagnosable, never hidden
          behind a generic "connected" badge. */}
      {status.error ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--danger)]/90">{status.error}</p>
      ) : null}
    </motion.section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs leading-relaxed text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  )
}
