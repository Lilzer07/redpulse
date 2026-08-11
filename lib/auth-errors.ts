import type { Dictionary } from "@/lib/i18n/dictionaries"

/**
 * Turns a Supabase auth error into safe, translated copy.
 *
 * Raw messages are never shown: the credential/existence signal is collapsed
 * into one generic string to avoid account enumeration. Errors the user must
 * act on (unconfirmed email, weak password, rate limits) are passed through,
 * because hiding those makes a normal sign-up look like a wrong password.
 */
export function authErrorMessage(error: { message?: string; code?: string; status?: number }, t: Dictionary): string {
  const code = error.code ?? ""
  const message = (error.message ?? "").toLowerCase()

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return t.auth.emailNotConfirmed
  }

  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) {
    return t.auth.rateLimited
  }

  // GoTrue returns a 500 "unexpected_failure" when the confirmation/reset email
  // can't be sent — almost always a custom SMTP (e.g. Resend) misconfiguration:
  // unverified sender domain, bad API key, or wrong from-address. Surface an
  // actionable message instead of the catch-all "unexpected error".
  if (
    message.includes("error sending") ||
    message.includes("confirmation email") ||
    message.includes("sending recovery") ||
    message.includes("sending email")
  ) {
    return t.auth.emailSendFailed
  }

  if (code === "weak_password" || message.includes("password should be at least")) {
    return t.auth.passwordTooShort
  }

  // Wrong password, unknown email, and "already registered" all collapse here.
  if (
    code === "invalid_credentials" ||
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("invalid login credentials") ||
    message.includes("already registered")
  ) {
    return t.auth.invalidCredentials
  }

  return t.auth.unexpectedError
}

/**
 * Logs the full, untranslated Supabase auth error so the exact cause is visible
 * during development and in the browser console on the deployed site. The UI
 * still shows only the safe, translated copy from `authErrorMessage`.
 *
 * Kept intentionally (not a temporary debug log): auth failures are otherwise
 * opaque because the user-facing strings are deliberately generic.
 */
export function logAuthError(
  context: string,
  error: { message?: string; code?: string; status?: number; name?: string } | null | undefined,
): void {
  if (!error) return
  console.error(`[auth] ${context} failed`, {
    name: error.name,
    code: error.code,
    status: error.status,
    message: error.message,
  })
}
