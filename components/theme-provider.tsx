"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

/**
 * Light/dark theming for the whole app.
 *
 * `attribute="class"` toggles `.dark` on <html>, which is exactly what the
 * `@custom-variant dark (&:is(.dark *))` in globals.css keys off, so every
 * token flips at once.
 *
 * `defaultTheme="dark"` preserves RedMatch's original look for anyone who has
 * never touched the setting — switching is opt-in, not a redesign.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
