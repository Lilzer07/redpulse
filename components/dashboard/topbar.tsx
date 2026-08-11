"use client"

import { Bell, Search } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n/context"

type Props = {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: Props) {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/8 bg-background/80 px-5 py-4 backdrop-blur-lg lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-foreground lg:text-xl">{title}</h1>
        {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-muted-foreground transition-colors hover:text-foreground sm:flex"
          aria-label={t.topbar.search}
        >
          <Search className="h-4.5 w-4.5" />
        </button>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t.topbar.notifications}
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-background" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground">
          MB
        </div>
      </div>
    </header>
  )
}
