"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"
import { makeRandomEvent, seedEvents, type MatchEvent } from "@/lib/data"

export function LiveDemo() {
  const [rows, setRows] = useState<MatchEvent[]>(seedEvents)

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => [makeRandomEvent(), ...prev].slice(0, 6))
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="demo" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Démonstration en direct</p>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Voyez les alertes tomber en temps réel
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Chaque ligne représente un carton rouge détecté puis notifié instantanément.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[var(--danger)]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
            </span>
            <span className="text-sm font-medium text-foreground">Flux en direct</span>
          </div>
          <span className="text-xs text-muted-foreground">Mise à jour automatique</span>
        </div>

        {/* Header row */}
        <div className="hidden grid-cols-[1.2fr_1.6fr_0.6fr_0.7fr_1fr_0.9fr] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Compétition</span>
          <span>Match</span>
          <span>Minute</span>
          <span>Score</span>
          <span>Événement</span>
          <span className="text-right">Notification</span>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, backgroundColor: "rgba(255,59,48,0.10)" }}
                animate={{ opacity: 1, backgroundColor: "rgba(255,59,48,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-2 gap-3 px-5 py-4 text-sm md:grid-cols-[1.2fr_1.6fr_0.6fr_0.7fr_1fr_0.9fr] md:items-center md:gap-4"
              >
                <span className="font-medium text-primary">{r.competition}</span>
                <span className="font-medium text-foreground">
                  {r.home} <span className="text-muted-foreground">vs</span> {r.away}
                </span>
                <span className="text-muted-foreground">{r.minute}&apos;</span>
                <span className="font-semibold text-foreground">{r.score}</span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--danger)]">
                  <span className="h-3.5 w-2.5 rounded-[2px] bg-[var(--danger)]" aria-hidden />
                  Carton rouge
                </span>
                <span className="flex items-center gap-1 md:justify-end">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Check className="h-3 w-3" aria-hidden /> Envoyée
                  </span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
