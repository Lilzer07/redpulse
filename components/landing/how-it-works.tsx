"use client"

import { motion } from "framer-motion"
import { steps } from "@/lib/data"

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="cv-auto relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Comment ça marche</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Opérationnel en quatre étapes
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Connecting line */}
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block"
            aria-hidden
          />
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.li
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-background text-lg font-bold text-primary shadow-[0_0_30px_-8px_rgba(24,201,100,0.5)]">
                  {s.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
