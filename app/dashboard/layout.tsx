import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { createClient } from "@/lib/supabase/server"
import { SessionProvider } from "@/lib/session-context"
import { getProfile, hasActiveSubscription } from "@/lib/user-data"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The proxy already redirects unauthenticated requests; this second check
  // keeps the dashboard safe if the matcher ever stops covering this route.
  if (!user) {
    redirect("/auth/login?next=/dashboard")
  }

  // An unconfirmed account has no business inside the dashboard, even if a
  // session cookie somehow exists.
  if (!user.email_confirmed_at) {
    redirect("/auth/login?reason=unconfirmed")
  }

  // Strict gate: every dashboard route requires an active plan, so this cannot
  // be bypassed by deep-linking past the choose-plan step.
  if (!(await hasActiveSubscription())) {
    redirect("/choose-plan")
  }

  const profile = await getProfile()

  return (
    <SessionProvider email={user.email ?? ""} profile={profile}>
      <div className="flex min-h-screen bg-background">
        <Sidebar userEmail={user.email} />
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">{children}</div>
        <MobileNav />
      </div>
    </SessionProvider>
  )
}
