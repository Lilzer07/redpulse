import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { createClient } from "@/lib/supabase/server"

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userEmail={user.email} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">{children}</div>
      <MobileNav />
    </div>
  )
}
