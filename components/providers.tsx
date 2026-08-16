"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import { ThemeProvider } from "@/components/theme-provider"

/**
 * App-wide client providers.
 * `reducedMotion="user"` makes every framer-motion animation automatically
 * respect the OS "prefers-reduced-motion" setting (transforms are neutralised,
 * opacity kept), so we honour accessibility without touching each component.
 * `I18nProvider` exposes the FR/EN dictionary to every client component.
 * `ThemeProvider` drives the light/dark class on <html> so the CSS tokens flip.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <I18nProvider>{children}</I18nProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
