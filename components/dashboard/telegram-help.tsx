"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n/context"

export function TelegramHelp() {
  const { t } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-7"
    >
      <h3 className="font-semibold text-foreground">{t.telegram.helpTitle}</h3>
      <ol className="mt-4 space-y-4">
        {t.telegram.helpSteps.map((text, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">{text}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}
