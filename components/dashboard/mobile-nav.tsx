"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Radio, Trophy, Send, CreditCard, type LucideIcon } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { SignOutButton } from "@/components/auth/sign-out-button"

// Index-aligned with `sidebar.mobileItems` in the dictionaries.
type NavItem = { href: string; icon: LucideIcon }

const items: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/dashboard/live", icon: Radio },
  { href: "/dashboard/competitions", icon: Trophy },
  { href: "/dashboard/telegram", icon: Send },
  { href: "/dashboard/billing", icon: CreditCard },
]

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-white/8 bg-[#070807]/95 backdrop-blur-lg lg:hidden">
      {items.map((item, i) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {t.sidebar.mobileItems[i]}
          </Link>
        )
      })}
      {/* The sidebar sign-out is desktop-only, so mobile needs its own tab. */}
      <SignOutButton variant="tab" />
    </nav>
  )
}
