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
