"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/landing/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n/context"

/** Shared frame for every /auth page: centered card, logo, language toggle. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const { t } = useI18n()

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 p-5">
        <Link href="/" aria-label={t.nav.home}>
          <Logo />
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-[rgb(var(--overlay)/0.08)] bg-[rgb(var(--overlay)/0.02)] p-7 shadow-2xl shadow-black/40">
            <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {t.auth.backHome}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export const authFieldClass =
  "h-12 w-full rounded-xl border border-[rgb(var(--overlay)/0.08)] bg-background/60 px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"

export const authButtonClass =
  "h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
