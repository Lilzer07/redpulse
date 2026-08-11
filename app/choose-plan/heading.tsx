"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n/context"

/** Client-side so the copy follows the language switcher like the rest of the app. */
export function ChoosePlanHeading({ email }: { email: string }) {
  const { t } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{t.choosePlan.eyebrow}</p>
      <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t.choosePlan.title}
      </h1>
      <p className="mt-4 text-pretty text-muted-foreground">{t.choosePlan.subtitle}</p>
      <p className="mt-2 text-sm text-muted-foreground/70">
        {t.choosePlan.signedInAs} <span className="font-medium text-foreground">{email}</span>
      </p>
    </motion.div>
  )
}
