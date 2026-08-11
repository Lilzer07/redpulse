"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { useI18n } from "@/lib/i18n/context"

export function SiteFooter() {
  const { t } = useI18n()
  const columns = t.footer.columns

  return (
    <footer className="relative border-t border-white/10 bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>{t.footer.rights}</p>
        <p className="text-pretty">{t.footer.notBetting}</p>
      </div>
    </footer>
  )
}
