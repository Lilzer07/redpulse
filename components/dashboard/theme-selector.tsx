"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, MonitorSmartphone } from "lucide-react"
import { useTheme } from "next-themes"
import { useI18n } from "@/lib/i18n/context"

/**
 * Real theme control: writes through next-themes, which sets the class on
 * <html> and persists the choice, so the whole app repaints immediately.
 */
export function ThemeSelector() {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  // The stored theme is unknown during SSR, so highlight nothing until mounted
  // rather than flashing the wrong active state.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const options = [
    { value: "light", label: t.settings.lightMode, Icon: Sun },
    { value: "dark", label: t.settings.darkMode, Icon: Moon },
    { value: "system", label: t.settings.systemMode, Icon: MonitorSmartphone },
  ] as const

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t.settings.themeDesc}</p>

      {/* Radiogroup rather than a switch: "system" is a third state a two-way
          toggle cannot express. Stacks on phones, inline from `sm` up. */}
      <div role="radiogroup" aria-label={t.settings.appearance.title} className="flex flex-col gap-2 sm:flex-row">
        {options.map(({ value, label, Icon }) => {
          const active = mounted && theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex min-h-12 flex-1 items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-[rgb(var(--overlay)/0.08)] bg-[rgb(var(--overlay)/0.02)] text-muted-foreground hover:bg-[rgb(var(--overlay)/0.06)] hover:text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
              {label}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">{t.settings.themeSystemHint}</p>
    </div>
  )
}
