"use client"

import { competitions, type Competition } from "@/lib/data"

function Chip({ c }: { c: Competition }) {
  return (
    <div className="group flex shrink-0 items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3 transition-colors duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold tracking-tight text-white/90 ring-1 ring-inset ring-white/10"
        style={{ backgroundColor: c.color }}
        aria-hidden
      >
        {c.abbr}
      </span>
      <span className="whitespace-nowrap text-sm font-medium text-white/40 transition-colors duration-300 group-hover:text-white/80">
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
  const half = Math.ceil(competitions.length / 2)
  const first = competitions.slice(0, half)
  const second = competitions.slice(half)

  return (
    <section className="relative overflow-hidden py-16" aria-label="Compétitions surveillées">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Plus de 20 compétitions surveillées en continu
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
