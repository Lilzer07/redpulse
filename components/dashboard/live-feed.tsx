"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Flame, Goal, Loader2, Sparkles, Trophy } from "lucide-react"
import { makeRandomEvent, seedEvents, type MatchEvent } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"

type Props = {
  intervalMs?: number
  max?: number
  compact?: boolean
}

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

export function LiveFeed({ intervalMs = 4000, max = 12, compact = false }: Props) {
  const { t } = useI18n()
  const [rows, setRows] = useState<MatchEvent[]>(() => seedEvents.slice(0, compact ? 4 : 6))

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => {
        const incoming = { ...makeRandomEvent(), status: "analyzing" as const }
        const next = [incoming, ...prev].slice(0, max)
        // Analyzing → sent, mimicking the AI producing its analysis.
        setTimeout(() => {
          setRows((cur) => cur.map((r) => (r.id === incoming.id ? { ...r, status: "sent" } : r)))
        }, 1400)
        return next
      })
    }, intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs, max])

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {rows.map((r) => (
          <motion.article
            key={r.id}
            layout
            initial={{ opacity: 0, y: -8, backgroundColor: "rgba(24,201,100,0.10)" }}
            animate={{ opacity: 1, y: 0, backgroundColor: "rgba(255,255,255,0.015)" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-white/8 p-4"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-sm font-semibold text-primary">{r.competition}</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
                <span className="h-3.5 w-2.5 rounded-[2px] bg-[var(--danger)]" aria-hidden />
                {r.team}
              </span>
              <span className="tabular-nums text-xs text-muted-foreground">{r.minute}&apos;</span>

              <span className="ml-auto">
                {r.status === "analyzing" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    {t.feed.analyzing}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    <Check className="h-3 w-3" aria-hidden />
                    {t.feed.sent}
                  </span>
                )}
              </span>
            </div>

            {/* Match */}
            <p className="mt-2 text-base font-semibold text-foreground">
              {r.home}{" "}
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-sm tabular-nums">{r.score}</span> {r.away}
            </p>

            {/* AI metrics */}
            {r.status === "analyzing" ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {t.feed.computing}
              </div>
            ) : (
              <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}>
                <Metric icon={Goal} label={t.feed.extraGoal} value={`${r.analysis.extraGoalProb}%`} />
                <Metric
                  icon={Trophy}
                  label={`${t.feed.win} ${r.analysis.favorite}`}
                  value={`${r.analysis.favoriteWinProb}%`}
                />
                <Metric icon={Flame} label={t.feed.confidence} value={`${r.analysis.impact}/100`} danger />
              </div>
            )}
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  )
}
