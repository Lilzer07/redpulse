"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Flame } from "lucide-react"
import { makeRandomEvent, seedEvents, type MatchEvent } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"

export function LiveDemo() {
  const { t } = useI18n()
  const [rows, setRows] = useState<MatchEvent[]>(seedEvents)

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => [makeRandomEvent(), ...prev].slice(0, 6))
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="demo" className="cv-auto relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.demo.eyebrow}</p>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t.demo.title}
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">{t.demo.subtitle}</p>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[var(--danger)]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
            </span>
            <span className="text-sm font-medium text-foreground">{t.demo.liveTitle}</span>
          </div>
          <span className="text-xs text-muted-foreground">{t.demo.autoUpdate}</span>
        </div>

        {/* Header row */}
        <div className="hidden grid-cols-[1.1fr_1.7fr_1.1fr_0.8fr_1.3fr_0.9fr] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <span>{t.demo.columns.competition}</span>
          <span>{t.demo.columns.match}</span>
          <span>{t.demo.columns.redCard}</span>
          <span>{t.demo.columns.extraGoal}</span>
          <span>{t.demo.columns.favoriteWin}</span>
          <span className="text-right">{t.demo.columns.confidence}</span>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, backgroundColor: "rgba(24,201,100,0.10)" }}
                animate={{ opacity: 1, backgroundColor: "rgba(24,201,100,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-2 gap-x-3 gap-y-2 px-5 py-4 text-sm md:grid-cols-[1.1fr_1.7fr_1.1fr_0.8fr_1.3fr_0.9fr] md:items-center md:gap-4"
              >
                <span className="font-medium text-primary">{r.competition}</span>
                <span className="font-medium text-foreground">
                  {r.home} <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs tabular-nums">{r.score}</span>{" "}
                  {r.away}
                </span>
                <span className="flex items-center gap-1.5 text-[var(--danger)]">
                  <span className="h-3.5 w-2.5 rounded-[2px] bg-[var(--danger)]" aria-hidden />
                  <span className="truncate text-xs font-medium">
                    {r.team} · {r.minute}&apos;
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-foreground">{r.analysis.extraGoalProb}%</span>
                <span className="truncate text-foreground">
                  <span className="text-muted-foreground">{r.analysis.favorite}</span>{" "}
                  <span className="font-semibold tabular-nums">{r.analysis.favoriteWinProb}%</span>
                </span>
                <span className="flex items-center gap-1 md:justify-end">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold tabular-nums text-primary">
                    <Flame className="h-3 w-3" aria-hidden /> {r.analysis.impact}/100
                  </span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
        {t.demo.disclaimer}
      </p>
    </section>
  )
}
