"use client"

import { motion } from "framer-motion"
import { Check, Flame, Goal, Inbox, Trophy } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import type { Alert } from "@/lib/user-data"

function Metric({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: typeof Goal
  label: string
  value: string
  danger?: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2">
      <Icon className={`h-4 w-4 shrink-0 ${danger ? "text-[var(--danger)]" : "text-primary"}`} aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`text-sm font-bold tabular-nums ${danger ? "text-primary" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  )
}

/**
 * Shown when the account has no alerts yet. A new user sees this instead of
 * demo rows, so their dashboard always reflects their own activity.
 */
function EmptyState({ hasCompetitions }: { hasCompetitions: boolean }) {
  const { t } = useI18n()
  const e = t.feed.empty

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground">
        <Inbox className="h-5 w-5" aria-hidden />
      </span>
      <p className="font-medium text-foreground">{e.title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {hasCompetitions ? e.waiting : e.noCompetitions}
      </p>
      {!hasCompetitions ? (
        <Link
          href="/dashboard/competitions"
          className="mt-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {e.pickCompetitions}
        </Link>
      ) : null}
    </div>
  )
}

export function AlertsFeed({
  alerts,
  hasCompetitions,
}: {
  alerts: Alert[]
  hasCompetitions: boolean
}) {
  const { t } = useI18n()

  if (alerts.length === 0) return <EmptyState hasCompetitions={hasCompetitions} />

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((r, i) => (
        <motion.article
          key={r.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
          className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.015] p-4"
        >
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-sm font-semibold text-primary">{r.competition}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
              <span className="h-3.5 w-2.5 rounded-[2px] bg-[var(--danger)]" aria-hidden />
              {r.carded_team}
            </span>
            <span className="tabular-nums text-xs text-muted-foreground">{r.minute}&apos;</span>

            <span className="ml-auto">
              {r.delivered_at ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  <Check className="h-3 w-3" aria-hidden />
                  {t.feed.sent}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {t.feed.pending}
                </span>
              )}
            </span>
          </div>

          {/* Match */}
          <p className="mt-2 text-base font-semibold text-foreground">
            {r.home_team}{" "}
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-sm tabular-nums">{r.score}</span>{" "}
            {r.away_team}
          </p>

          {/* AI metrics */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Metric icon={Goal} label={t.feed.extraGoal} value={`${r.extra_goal_prob}%`} />
            <Metric icon={Trophy} label={`${t.feed.win} ${r.favorite}`} value={`${r.favorite_win_prob}%`} />
            <Metric icon={Flame} label={t.feed.confidence} value={`${r.impact}/100`} danger />
          </div>
        </motion.article>
      ))}
    </div>
  )
}
