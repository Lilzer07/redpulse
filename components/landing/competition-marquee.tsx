"use client"

import { useState } from "react"
import { Shield } from "lucide-react"
import { competitions, type Competition } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"

function CompetitionMark({ c }: { c: Competition }) {
  // Show the official league badge when available; otherwise a discreet,
  // neutral placeholder (no initials chips).
  const [failed, setFailed] = useState(false)
  const showLogo = Boolean(c.logo) && !failed

  if (showLogo) {
    return (
      <span className="flex h-9 w-9 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.logo as string}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          width={36}
          height={36}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        />
      </span>
    )
  }

  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgb(var(--overlay)/0.04)] ring-1 ring-inset ring-[rgb(var(--overlay)/0.1)]"
      aria-hidden
    >
      <Shield className="h-4 w-4 text-[rgb(var(--overlay)/0.25)]" />
    </span>
  )
}

function Chip({ c }: { c: Competition }) {
  return (
    <div className="group flex shrink-0 items-center gap-3 rounded-2xl border border-[rgb(var(--overlay)/0.05)] bg-[rgb(var(--overlay)/0.02)] px-5 py-3 transition-colors duration-300 hover:border-primary/30 hover:bg-[rgb(var(--overlay)/0.04)]">
      <CompetitionMark c={c} />
      <span className="whitespace-nowrap text-sm font-medium text-[rgb(var(--overlay)/0.4)] transition-colors duration-300 group-hover:text-[rgb(var(--overlay)/0.8)]">
        {c.name}
      </span>
    </div>
  )
}

function Row({ items, reverse, duration }: { items: Competition[]; reverse?: boolean; duration: string }) {
  const doubled = [...items, ...items]
  return (
    <div className="flex w-max" style={{ ["--marquee-duration" as string]: duration }}>
      <div className={`flex gap-4 pr-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {doubled.map((c, i) => (
          <Chip key={`${c.id}-${i}`} c={c} />
        ))}
      </div>
    </div>
  )
}

export function CompetitionMarquee() {
  const { t } = useI18n()
  const half = Math.ceil(competitions.length / 2)
  const first = competitions.slice(0, half)
  const second = competitions.slice(half)

  return (
    <section id="competitions" className="relative scroll-mt-24 overflow-hidden py-16" aria-label={t.marquee.label}>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {t.marquee.title}
        </p>
      </div>

      <div className="marquee-pause relative flex flex-col gap-4">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent sm:w-40" />

        <Row items={first} duration="55s" />
        <Row items={second} reverse duration="65s" />
      </div>
    </section>
  )
}
