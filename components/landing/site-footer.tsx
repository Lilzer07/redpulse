"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { useI18n } from "@/lib/i18n/context"

export function SiteFooter() {
  const { t } = useI18n()
  const columns = t.footer.columns

  return (
    <footer className="relative border-t border-[rgb(var(--overlay)/0.1)] bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => {
                const className = "text-sm text-muted-foreground transition-colors hover:text-primary"
                const isExternal = link.href.startsWith("mailto:") || link.href.startsWith("http")
                return (
                  <li key={link.label}>
                    {isExternal ? (
                      <a href={link.href} className={className}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={className}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[rgb(var(--overlay)/0.1)] px-6 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>{t.footer.rights}</p>
        <p className="flex items-center gap-1.5 text-pretty">
          <span>{t.footer.supportLabel}</span>
          <span aria-hidden="true">·</span>
          <a
            href={`mailto:${t.footer.supportEmail}`}
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {t.footer.supportEmail}
          </a>
        </p>
        <p className="text-pretty">{t.footer.notBetting}</p>
      </div>
    </footer>
  )
}
