"use client"

import Link from "next/link"
import { MailCheck } from "lucide-react"
import { AuthShell, authButtonClass } from "@/components/auth/auth-shell"
import { useI18n } from "@/lib/i18n/context"

export default function SignUpSuccessPage() {
  const { t } = useI18n()

  return (
    <AuthShell title={t.auth.checkEmailTitle}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-inset ring-primary/25">
          <MailCheck className="h-5.5 w-5.5 text-primary" aria-hidden />
        </span>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.auth.checkEmailBody}</p>
        <Link href="/auth/login" className={`${authButtonClass} mt-6 flex items-center justify-center`}>
          {t.auth.goToLogin}
        </Link>
      </div>
    </AuthShell>
  )
}
