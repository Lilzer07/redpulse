"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n/dictionaries"

const STORAGE_KEY = "redmatch:locale"
// Pre-rename key: still read once so existing visitors keep their language choice.
const LEGACY_STORAGE_KEY = "redpulse:locale"

type I18nValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always start from "fr" so the server render and the first client render are
  // byte-identical (React hydrates against "fr"). The stored/browser preference
  // is adopted in an effect below, i.e. strictly AFTER hydration has completed.
  const [locale, setLocaleState] = useState<Locale>("fr")

  // `useEffect` in a component that renders the whole tree still runs *during*
  // hydration for the initial mount, so switching the locale here rewrites every
  // translated string while React is still matching server HTML — that is what
  // produced the "server rendered HTML didn't match the client" error. Deferring
  // the switch to the next frame lets hydration finish first, after which the
  // language change is a normal, safe client re-render.
  useEffect(() => {
    let cancelled = false

    const resolvePreference = (): Locale | null => {
      let next: Locale | null = null
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
        if (stored === "fr" || stored === "en") next = stored
      } catch {
        // localStorage unavailable (private mode) — fall back to browser language.
      }
      if (!next && navigator.language?.toLowerCase().startsWith("en")) next = "en"
      return next
    }

    const id = window.requestAnimationFrame(() => {
      if (cancelled) return
      const next = resolvePreference()
      if (next && next !== "fr") setLocaleState(next)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
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
