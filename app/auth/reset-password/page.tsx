"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { AuthShell, authButtonClass } from "@/components/auth/auth-shell"
import { PasswordField } from "@/components/auth/password-field"
import { createClient } from "@/lib/supabase/client"
import { authErrorMessage } from "@/lib/auth-errors"
import { useI18n } from "@/lib/i18n/context"

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [checking, setChecking] = useState(true)

  // The recovery link opens a real session. Without one there is nothing to
  // update, so send the user back to request a fresh link.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/error?reason=missing_token")
        return
      }
      setChecking(false)
    })
  }, [router])

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
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(authErrorMessage(updateError, t))
      setPending(false)
      return
    }

    router.replace("/dashboard")
    router.refresh()
  }

  if (checking) {
    return (
      <AuthShell title={t.auth.resetTitle}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
          {t.auth.confirmingWait}
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t.auth.resetTitle} subtitle={t.auth.resetSubtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordField
          id="password"
          label={t.auth.newPassword}
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
              {t.auth.updating}
            </>
          ) : (
            t.auth.updatePassword
          )}
        </button>
      </form>
    </AuthShell>
  )
}
