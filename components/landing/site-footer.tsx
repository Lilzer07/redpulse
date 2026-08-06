"use client"

import Link from "next/link"
import { Logo } from "./logo"

const columns = [
  {
    title: "Produit",
    links: ["Fonctionnalités", "Compétitions", "Tarification", "Démonstration"],
  },
  {
    title: "Entreprise",
    links: ["À propos", "Blog", "Carrières", "Contact"],
  },
  {
    title: "Légal",
    links: ["Confidentialité", "Conditions", "Cookies", "Mentions légales"],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            La surveillance football en temps réel. Ne manquez plus jamais un carton rouge.
          </p>
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
        <p>© 2026 RedPulse. Tous droits réservés.</p>
        <p className="text-pretty">Outil de surveillance football en temps réel — pas un service de paris.</p>
      </div>
    </footer>
  )
}
