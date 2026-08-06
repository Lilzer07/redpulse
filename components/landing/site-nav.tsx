"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { Logo } from "@/components/landing/logo"

const links = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#demo", label: "Démo" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
          scrolled ? "glass shadow-2xl shadow-black/40" : "border border-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="RedPulse accueil">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" className="text-muted-foreground hover:text-foreground">
            Connexion
          </ButtonLink>
          <ButtonLink
            href="/dashboard"
            className="rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Commencer
          </ButtonLink>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass absolute inset-x-4 top-20 z-50 flex flex-col gap-1 rounded-2xl p-3 md:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
            <ButtonLink href="/login" variant="ghost">
              Connexion
            </ButtonLink>
            <ButtonLink href="/dashboard" className="bg-primary font-semibold text-primary-foreground">
              Commencer
            </ButtonLink>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
