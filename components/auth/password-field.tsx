"use client"

import { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { authFieldClass } from "@/components/auth/auth-shell"
import { useI18n } from "@/lib/i18n/context"

/**
 * Password input with a visibility toggle.
 *
 * The toggle is a real <button type="button"> so it never submits the form, and
 * it keeps aria-pressed + an sr-only label so screen readers announce the state
 * change rather than just "button".
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  minLength,
  hint,
  action,
}: {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: "current-password" | "new-password"
  minLength?: number
  hint?: string
  /** Optional element rendered on the label row, e.g. a "forgot password" link. */
  action?: React.ReactNode
}) {
  const { t } = useI18n()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {action}
      </div>

      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${authFieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-controls={inputId}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          <span className="sr-only">{visible ? t.auth.hidePassword : t.auth.showPassword}</span>
        </button>
      </div>

      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  )
}
