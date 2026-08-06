"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Radio,
  Trophy,
  Send,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { Logo } from "@/components/landing/logo"

type NavItem = { href: string; label: string; icon: LucideIcon }

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/live", label: "Flux en direct", icon: Radio },
  { href: "/dashboard/competitions", label: "Compétitions", icon: Trophy },
  { href: "/dashboard/telegram", label: "Telegram", icon: Send },
  { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/8 bg-[#070807] p-4 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2 pt-2" aria-label="RedPulse accueil">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-0 rounded-xl bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 h-4.5 w-4.5" aria-hidden />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden />
          <p className="text-xs font-medium text-foreground">Système opérationnel</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Surveillance active sur 22 compétitions.
        </p>
      </div>
    </aside>
  )
}
