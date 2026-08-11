"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Loader2, MailCheck } from "lucide-react"
import { AuthShell, authButtonClass, authFieldClass } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"
import { authErrorMessage } from "@/lib/auth-errors"
import { useI18n } from "@/lib/i18n/context"

export default function ForgotPasswordPage() {
  const { t } = useI18n()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const supabase = createClient()
    // Only consumed by templates built on {{ .ConfirmationURL }}; the branded
    // RedPulse template links straight to /auth/confirm with {{ .TokenHash }}.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (resetError) {
      setError(authErrorMessage(resetError, t))
      setPending(false)
      return
    }

    // Always show success: revealing whether an address exists would leak accounts.
    setSent(true)
    setPending(false)
  }

  if (sent) {
    return (
      <AuthShell title={t.auth.resetSentTitle} subtitle={t.auth.resetSentBody}>
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3.5">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-foreground">{email}</p>
          </div>
          <Link href="/auth/login" className={`${authButtonClass} flex items-center justify-center`}>
            {t.auth.goToLogin}
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={t.auth.forgotTitle}
      subtitle={t.auth.forgotSubtitle}
      footer={
        <>
          {t.auth.rememberedIt}{" "}
          <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.auth.signInLink}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {t.auth.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.emailPlaceholder}
            className={authFieldClass}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/[0.06] px-3.5 py-3 text-sm text-[var(--danger)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`${authButtonClass} mt-1 flex items-center justify-center gap-2`}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.auth.sending}
            </>
          ) : (
            t.auth.sendResetLink
          )}
        </button>
      </form>
    </AuthShell>
  )
}
