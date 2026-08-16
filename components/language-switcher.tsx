"use client"

import { useId } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n/context"
import { locales } from "@/lib/i18n/dictionaries"

/**
 * Compact FR/EN segmented control. The active pill slides between the two
 * options via a shared layoutId, matching the sidebar's active-item motion.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  // Scope the layoutId per instance: the desktop nav and the mobile menu each
  // render a switcher, and a shared layoutId would let one hide the other's pill.
  const pillId = useId()

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={`isolate flex items-center gap-0.5 rounded-xl border border-[rgb(var(--overlay)/0.1)] bg-[rgb(var(--overlay)/0.03)] p-0.5 ${className}`}
    >
      {locales.map((l) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={`relative rounded-[0.6rem] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`locale-pill-${pillId}`}
                className="absolute inset-0 z-0 rounded-[0.6rem] bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{l}</span>
          </button>
        )
      })}
    </div>
  )
}
