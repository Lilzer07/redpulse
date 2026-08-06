"use client"

import { motion } from "framer-motion"
import { testimonials } from "@/lib/data"

export function Testimonials() {
  return (
    <section className="cv-auto relative mx-auto max-w-6xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Avis clients</p>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Ils ne ratent plus rien
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.handle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
            className="flex flex-col rounded-3xl border border-white/8 bg-white/[0.02] p-6"
          >
            <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20">
                {t.initials}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.handle}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
