"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"
import { I18nProvider } from "@/lib/i18n/context"

/**
 * App-wide client providers.
 * `reducedMotion="user"` makes every framer-motion animation automatically
 * respect the OS "prefers-reduced-motion" setting (transforms are neutralised,
 * opacity kept), so we honour accessibility without touching each component.
 * `I18nProvider` exposes the FR/EN dictionary to every client component.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>{children}</I18nProvider>
    </MotionConfig>
  )
}
