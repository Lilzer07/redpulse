import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { hasActiveSubscription } from "@/lib/user-data"
import { Logo } from "@/components/landing/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { PlanPicker } from "./plan-picker"
import { ChoosePlanHeading } from "./heading"

export default async function ChoosePlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Signing up is what leads here, so an anonymous visitor has nothing to pick for.
  if (!user) redirect("/auth/login?next=/choose-plan")

  // Already paid: this step is done, don't make them look at it again.
  if (await hasActiveSubscription()) redirect("/dashboard")

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 p-5">
        <Link href="/" aria-label="RedPulse">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 pb-16 pt-4">
        <ChoosePlanHeading email={user.email ?? ""} />
        <div className="mt-10">
          <PlanPicker />
        </div>
      </div>
    </main>
  )
}
