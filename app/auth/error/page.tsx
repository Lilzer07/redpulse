"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { AuthShell, authButtonClass } from "@/components/auth/auth-shell"
import { useI18n } from "@/lib/i18n/context"

export default function AuthErrorPage() {
  const { t } = useI18n()

  return (
    <AuthShell title={t.auth.errorTitle}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger)]/10 ring-1 ring-inset ring-[var(--danger)]/25">
          <AlertCircle className="h-5.5 w-5.5 text-[var(--danger)]" aria-hidden />
        </span>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.auth.errorBody}</p>
        <Link href="/auth/sign-up" className={`${authButtonClass} mt-6 flex items-center justify-center`}>
          {t.auth.signUp}
        </Link>
      </div>
    </AuthShell>
  )
}
