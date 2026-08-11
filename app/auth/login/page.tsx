"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { AuthShell, authButtonClass, authFieldClass } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"
import { authErrorMessage } from "@/lib/auth-errors"
import { useI18n } from "@/lib/i18n/context"

function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Set by the proxy when it intercepts a protected route.
  const next = searchParams.get("next") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(authErrorMessage(signInError, t))
      setPending(false)
      return
    }

    // refresh() lets the server re-read the new auth cookies before navigating.
    router.replace(next)
    router.refresh()
  }

  return (
    <AuthShell
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.auth.createOne}
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              {t.auth.signingIn}
            </>
          ) : (
            t.auth.signIn
          )}
        </button>
      </form>
    </AuthShell>
  )
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary during prerendering.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
