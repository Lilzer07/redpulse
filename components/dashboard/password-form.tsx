"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Check } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { changePassword } from "@/app/dashboard/actions"

const fieldClass =
  "h-12 w-full rounded-xl border border-[rgb(var(--overlay)/0.08)] bg-background/60 px-4 pr-12 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"

/**
 * In-place password change, backed by the existing `changePassword` server
 * action (Supabase `updateUser`). The emailed reset link stays available as a
 * fallback for people who cannot recall the current password.
 */
export function PasswordForm() {
  const { t } = useI18n()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [reveal, setReveal] = useState(false)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setDone(false)

    // Validate on the client for instant feedback; the server action re-checks
    // the length itself, so this is convenience rather than the real guard.
    if (password.length < 8) return setError(t.settings.passwordTooShort)
    if (password !== confirm) return setError(t.settings.passwordMismatch)

    setPending(true)
    const result = await changePassword(password)
    setPending(false)

    if (!result.ok) {
      setError(result.error === "weak-password" ? t.settings.passwordTooShort : t.settings.passwordError)
      return
    }

    // Never keep the new secret in component state after a success.
    setPassword("")
    setConfirm("")
    setDone(true)
    setTimeout(() => setDone(false), 4000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="font-medium text-foreground">{t.settings.password}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.settings.passwordDesc}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium text-foreground">
            {t.settings.newPassword}
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={reveal ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? t.auth.hidePassword : t.auth.showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {reveal ? <EyeOff className="h-4.5 w-4.5" aria-hidden /> : <Eye className="h-4.5 w-4.5" aria-hidden />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
            {t.settings.confirmPassword}
          </label>
          <input
            id="confirm-password"
            type={reveal ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            className={fieldClass}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t.auth.passwordMinHint}</p>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !password || !confirm}
          className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? t.settings.passwordUpdating : t.settings.changePassword}
        </button>

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t.settings.passwordForgot}
        </Link>

        {done ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-primary">
            <Check className="h-4 w-4" aria-hidden />
            {t.settings.passwordUpdated}
          </span>
        ) : null}
      </div>
    </form>
  )
}
