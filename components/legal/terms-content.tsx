"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/landing/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n/context"

export function TermsContent() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-[rgb(var(--overlay)/0.08)] p-5">
        <Link href="/" aria-label={t.nav.home}>
          <Logo />
        </Link>
        <LanguageSwitcher />
      </header>

      <article className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground">{t.terms.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.terms.updated}</p>

        <div className="mt-10 flex flex-col gap-9">
          {t.terms.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-2.5">
              <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/[0.05] px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
          {t.terms.disclaimer}
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t.auth.backHome}
          </Link>
        </div>
      </article>
    </main>
  )
}
