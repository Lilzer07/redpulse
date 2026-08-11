"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useI18n } from "@/lib/i18n/context"

export function Faq() {
  const { t } = useI18n()

  return (
    <section id="faq" className="cv-auto relative mx-auto max-w-3xl scroll-mt-24 px-5 py-24">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.faq.eyebrow}</p>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t.faq.title}
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="mt-12"
      >
        <Accordion className="space-y-3">
          {t.faq.items.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] px-5"
            >
              <AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
