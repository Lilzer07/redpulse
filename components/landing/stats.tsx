"use client"

import { motion } from "framer-motion"
import { stats } from "@/lib/data"
import { AnimatedCounter } from "@/components/landing/animated-counter"

export function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="glass rounded-3xl p-6 text-center"
          >
            <div className="text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              <AnimatedCounter
                value={s.value}
                decimals={s.decimals ?? 0}
                prefix={s.prefix ?? ""}
                suffix={s.suffix ?? ""}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
