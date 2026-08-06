"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { makeRandomEvent, seedEvents, type MatchEvent } from "@/lib/data"

type Props = {
  intervalMs?: number
  max?: number
  compact?: boolean
}

export function LiveFeed({ intervalMs = 4000, max = 12, compact = false }: Props) {
  const [rows, setRows] = useState<MatchEvent[]>(() => seedEvents.slice(0, compact ? 4 : 6))

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => {
        const incoming = { ...makeRandomEvent(), status: "sending" as const }
        const next = [incoming, ...prev].slice(0, max)
        // Flip status to "sent" shortly after arrival.
        setTimeout(() => {
          setRows((cur) => cur.map((r) => (r.id === incoming.id ? { ...r, status: "sent" } : r)))
        }, 1200)
        return next
      })
    }, intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs, max])

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      {/* Header */}
      <div
        className={`grid items-center gap-3 border-b border-white/8 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${
          compact ? "grid-cols-[1fr_auto]" : "grid-cols-[1.2fr_1.6fr_auto_auto_1fr_auto] px-5"
        }`}
      >
        <span>Compétition</span>
        {!compact && <span>Match</span>}
        {!compact && <span className="text-center">Min.</span>}
        {!compact && <span className="text-center">Score</span>}
        {!compact && <span>Événement</span>}
        <span className="text-right">Statut</span>
      </div>

      <div className="divide-y divide-white/5">
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, backgroundColor: "rgba(255,59,48,0.12)" }}
              animate={{ opacity: 1, backgroundColor: "rgba(255,59,48,0)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`grid items-center gap-3 px-4 py-3.5 text-sm ${
                compact ? "grid-cols-[1fr_auto]" : "grid-cols-[1.2fr_1.6fr_auto_auto_1fr_auto] px-5"
              }`}
            >
              <span className="truncate font-medium text-primary">{r.competition}</span>

              {!compact && (
                <span className="truncate text-foreground">
                  {r.home} <span className="text-muted-foreground">vs</span> {r.away}
                </span>
              )}
              {!compact && <span className="text-center tabular-nums text-muted-foreground">{r.minute}&apos;</span>}
              {!compact && (
                <span className="text-center">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                    {r.score}
                  </span>
                </span>
              )}

              {compact ? (
                <span className="flex items-center justify-end gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
                    <span className="h-3.5 w-2.5 rounded-[2px] bg-[var(--danger)]" aria-hidden />
                    {r.minute}&apos;
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-[var(--danger)]">
                  <span className="h-3.5 w-2.5 rounded-[2px] bg-[var(--danger)]" aria-hidden />
                  <span className="text-xs font-semibold">Carton rouge</span>
                </span>
              )}

              <span className="flex justify-end">
                {r.status === "sending" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Envoi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    <Check className="h-3 w-3" aria-hidden />
                    Envoyée
                  </span>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
