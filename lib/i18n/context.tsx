"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n/dictionaries"

const STORAGE_KEY = "redpulse:locale"

type I18nValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start from "fr" so the server and first client render match
  // (no hydration mismatch), then adopt the stored/browser preference.
  const [locale, setLocaleState] = useState<Locale>("fr")

  useEffect(() => {
    let next: Locale | null = null
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "fr" || stored === "en") next = stored
    } catch {
      // localStorage unavailable (private mode) — fall back to browser language.
    }
    if (!next && typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en")) {
      next = "en"
    }
    if (next && next !== "fr") setLocaleState(next)
  }, [])

  // Keep <html lang> in sync for accessibility and SEO.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // Persisting the choice is best-effort only.
    }
  }, [])

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t: dictionaries[locale] }), [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>")
  return ctx
}
