"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { AuthShell, authButtonClass, authFieldClass } from "@/components/auth/auth-shell"
import { PasswordField } from "@/components/auth/password-field"
import { createClient } from "@/lib/supabase/client"
import { authCallbackUrl } from "@/lib/supabase/auth-redirect"
import { authErrorMessage } from "@/lib/auth-errors"
import { useI18n } from "@/lib/i18n/context"

export default function SignUpPage() {
  const { t } = useI18n()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t.auth.passwordTooShort)
      return
    }
    if (password !== confirm) {
      setError(t.auth.passwordMismatch)
      return
    }
    if (!acceptedTerms) {
      setError(t.auth.termsRequired)
      return
    }

    setPending(true)
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Keep a record of when the terms were accepted.
        data: { terms_accepted_at: new Date().toISOString() },
        // Consumed by templates built on {{ .ConfirmationURL }}. In production this
        // resolves to the live origin (e.g. https://redpulse-seven.vercel.app) so the
        // PKCE verifier cookie matches; only the dev preview routes via the proxy.
        emailRedirectTo: authCallbackUrl(),
      },
    })

    if (signUpError) {
      setError(authErrorMessage(signUpError, t))
      setPending(false)
      return
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <AuthShell
      title={t.auth.signUpTitle}
      subtitle={t.auth.signUpSubtitle}
      footer={
        <>
          {t.auth.hasAccount}{" "}
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

        <PasswordField
          id="password"
          label={t.auth.password}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
          hint={t.auth.passwordMinHint}
        />

        <PasswordField
          id="confirm"
          label={t.auth.confirmPassword}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-background/60 text-primary accent-[var(--primary)]"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            {t.auth.termsPrefix}{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t.auth.termsLink}
            </Link>
            {t.auth.termsSuffix}
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/[0.06] px-3.5 py-3 text-sm text-[var(--danger)]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${authButtonClass} mt-1 flex items-center justify-center gap-2`}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.auth.signingUp}
            </>
          ) : (
            t.auth.signUp
          )}
        </button>
      </form>
    </AuthShell>
  )
}
