"use client"

import { motion } from "framer-motion"
import { Gauge, Globe, Send, ShieldCheck, Sliders, Zap, type LucideIcon } from "lucide-react"
import { features } from "@/lib/data"

const icons: Record<string, LucideIcon> = {
  zap: Zap,
  globe: Globe,
  send: Send,
  sliders: Sliders,
  gauge: Gauge,
  "shield-check": ShieldCheck,
}

export function Features() {
  return (
    <section id="fonctionnalites" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Fonctionnalités</p>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Une seule mission, exécutée à la perfection
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Tout ce dont vous avez besoin pour ne jamais rater un carton rouge, et rien de superflu.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = icons[f.icon]
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02] p-7 transition-colors duration-300 hover:border-primary/30"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-inset ring-primary/20">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
