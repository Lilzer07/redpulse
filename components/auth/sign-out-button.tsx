"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n/context"

export function SignOutButton({
  className = "",
  variant = "row",
}: {
  className?: string
  /** "tab" matches the mobile bottom-nav items; "row" is the sidebar/settings style. */
  variant?: "row" | "tab"
}) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleSignOut() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // refresh() clears the server-rendered session before the redirect.
    router.replace("/")
    router.refresh()
  }

  if (variant === "tab") {
    return (
      <button
        onClick={handleSignOut}
        disabled={pending}
        className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60 ${className}`}
      >
        <LogOut className="h-5 w-5" aria-hidden />
        {t.auth.signOutShort}
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={pending}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-4.5 w-4.5" aria-hidden />
      {t.auth.signOut}
    </button>
  )
}
