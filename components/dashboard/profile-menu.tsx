"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, LogOut, Sun, Moon, LayoutDashboard, CreditCard } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n/context"
import { useSession } from "@/lib/session-context"

/** Initials from the account name or email — never a hardcoded persona. */
function initialsFrom(name: string | null, email: string) {
  const source = name?.trim() || email.split("@")[0] || ""
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)
  return letters.toUpperCase() || "?"
}

/**
 * The avatar in the top-right corner, and the menu behind it.
 *
 * On phones the sidebar is hidden, so this menu is the only way to reach
 * Settings — that is its main job. It also mirrors the theme toggle and sign-out
 * so the common actions are one tap away on every viewport.
 */
export function ProfileMenu() {
  const { t } = useI18n()
  const { email, displayName } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const [pending, setPending] = useState(false)

  // `resolvedTheme` turns "system" into the concrete theme actually painted, so
  // the label always describes what the next tap will do.
  const isDark = resolvedTheme !== "light"

  async function handleSignOut() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.topbar.account}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {initialsFrom(displayName, email)}
      </DropdownMenuTrigger>

      {/* `w-auto` overrides the wrapper default of `w-(--anchor-width)`, which
          would otherwise clamp the menu to the 40px avatar. */}
      <DropdownMenuContent align="end" sideOffset={8} className="w-auto min-w-56 p-1.5">
        {/* Plain div, not DropdownMenuLabel: Base UI requires that label to live
            inside a Menu.Group, and this header is decoration, not a menu item. */}
        <div className="px-2 py-1.5">
          {displayName ? (
            <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
          ) : null}
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        </div>

        <DropdownMenuSeparator />

        {/* Dashboard and Billing are sidebar-only on desktop, so phones get them
            here too rather than only in the bottom bar. */}
        <DropdownMenuItem
          render={<Link href="/dashboard" />}
          className="cursor-pointer gap-2.5 px-2 py-2 lg:hidden"
        >
          <LayoutDashboard aria-hidden />
          {t.sidebar.items[0]}
        </DropdownMenuItem>

        <DropdownMenuItem
          render={<Link href="/dashboard/billing" />}
          className="cursor-pointer gap-2.5 px-2 py-2 lg:hidden"
        >
          <CreditCard aria-hidden />
          {t.sidebar.items[4]}
        </DropdownMenuItem>

        <DropdownMenuItem
          render={<Link href="/dashboard/settings" />}
          className="cursor-pointer gap-2.5 px-2 py-2"
        >
          <Settings aria-hidden />
          {t.settings.title}
        </DropdownMenuItem>

        {/* closeOnClick={false} keeps the menu open so the colour change is
            visible immediately, and the theme can be toggled back and forth. */}
        <DropdownMenuItem
          closeOnClick={false}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="cursor-pointer gap-2.5 px-2 py-2"
        >
          {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
          {isDark ? t.settings.lightMode : t.settings.darkMode}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={handleSignOut}
          className="cursor-pointer gap-2.5 px-2 py-2"
        >
          <LogOut aria-hidden />
          {t.auth.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
