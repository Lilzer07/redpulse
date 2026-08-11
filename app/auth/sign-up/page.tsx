"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { AuthShell, authButtonClass, authFieldClass } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"
import { authErrorMessage } from "@/lib/auth-errors"
import { useI18n } from "@/lib/i18n/context"

export default function SignUpPage() {
  const { t } = useI18n()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
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

    setPending(true)
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Route the confirmation link through the v0 proxy so it reaches this preview.
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
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

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            {t.auth.password}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
          />
          <p className="text-xs text-muted-foreground/70">{t.auth.passwordMinHint}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm" className="text-sm font-medium text-foreground">
            {t.auth.confirmPassword}
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
