"use client"

import { use } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { AuthShell, authButtonClass } from "@/components/auth/auth-shell"
import { useI18n } from "@/lib/i18n/context"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = use(searchParams)
  const { t } = useI18n()

  // An expired-or-already-used link is by far the most common case: the token is
  // single-use, so a second click (or an email client prefetching it) lands here.
  // Offering sign-in first avoids sending people to create a duplicate account.
  const isExpired = !reason || /invalid|expired/i.test(reason)

  return (
    <AuthShell title={t.auth.errorTitle}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger)]/10 ring-1 ring-inset ring-[var(--danger)]/25">
          <AlertCircle className="h-5.5 w-5.5 text-[var(--danger)]" aria-hidden />
        </span>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {isExpired ? t.auth.errorBodyExpired : t.auth.errorBody}
        </p>

        <Link href="/auth/login" className={`${authButtonClass} mt-6 flex items-center justify-center`}>
          {t.auth.goToLogin}
        </Link>

        <Link
          href="/auth/sign-up"
          className="mt-3 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t.auth.resendLink}
        </Link>
      </div>
    </AuthShell>
  )
}
