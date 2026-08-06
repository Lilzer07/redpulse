"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Send } from "lucide-react"
import { makeRandomEvent, seedEvents, type MatchEvent } from "@/lib/data"

type Notif = MatchEvent & { time: string }

function nowLabel() {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export function TelegramPhone() {
  const [notifs, setNotifs] = useState<Notif[]>(() =>
    seedEvents.slice(0, 3).map((e) => ({ ...e, time: nowLabel() })),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifs((prev) => {
        const next = { ...makeRandomEvent(), time: nowLabel() }
        return [next, ...prev].slice(0, 4)
      })
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mx-auto w-[300px] sm:w-[330px]">
      {/* Ambient glow */}
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/20 blur-3xl" aria-hidden />

      {/* Phone frame */}
      <div className="relative rounded-[2.8rem] border border-white/10 bg-[#0a0b0a] p-3 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#0f110f] to-[#070807]">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" aria-hidden />

          {/* Telegram header */}
          <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-4 pb-3 pt-9 backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Send className="h-4 w-4 text-primary-foreground" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">RedPulse Bot</p>
              <p className="text-[11px] text-primary">en ligne</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              live
            </span>
          </div>

          {/* Messages */}
          <div className="flex h-[420px] flex-col-reverse gap-3 overflow-hidden p-4">
            <AnimatePresence initial={false} mode="popLayout">
              {notifs.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="rounded-2xl rounded-tl-md border border-[var(--danger)]/20 bg-[var(--danger)]/[0.06] p-3.5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-5 w-3.5 items-center justify-center rounded-[3px] bg-[var(--danger)] shadow-[0_0_10px_rgba(255,59,48,0.6)]" aria-hidden />
                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--danger)]">
                      Carton rouge
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{n.minute}&apos;</span>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary">{n.competition}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {n.home} <span className="text-muted-foreground">vs</span> {n.away}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-semibold text-foreground">
                      {n.score}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-primary">
                      <Check className="h-3 w-3" aria-hidden /> Envoyée · {n.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
