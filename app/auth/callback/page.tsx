"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n/context"

/**
 * Compatibility callback for Supabase's *default* email template.
 *
 * That template links to /auth/v1/verify, which answers with a 303 to
 * `<redirect_to>#access_token=...&refresh_token=...`. The session lives in the URL
 * fragment, and fragments are never transmitted to the server -- which is why a
 * server route handler here saw no params at all and fell through to /auth/error.
 *
 * This runs in the browser so it can read `location.hash`. The branded RedMatch
 * email instead points at /auth/confirm, which is fully server-side.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [failed, setFailed] = useState(false)
  // React may mount effects twice in dev; the tokens are single-use.
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const complete = async () => {
      const supabase = createClient()
      const url = new URL(window.location.href)
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""))
      const next = url.searchParams.get("next") ?? hash.get("next") ?? "/dashboard"

      // A full-page navigation, so the server re-reads the fresh session cookies
      // (the dashboard/plan gate runs server-side).
      const succeed = () => window.location.assign(next)

      // Confirming a link also confirms the account server-side, so even when the
      // client-side exchange can't complete (link already consumed, opened in a
      // different browser, missing PKCE verifier) a valid session may already
      // exist. Treat that as success instead of a false "invalid or expired".
      const hasSession = async () => {
        const { data } = await supabase.auth.getUser()
        return !!data.user
      }

      const fail = async (reason: string) => {
        if (await hasSession()) {
          succeed()
          return
        }
        setFailed(true)
        router.replace(`/auth/error?reason=${encodeURIComponent(reason)}`)
      }

      const errorDescription = url.searchParams.get("error_description") ?? hash.get("error_description")
      if (errorDescription) {
        await fail(errorDescription)
        return
      }

      // Preferred: a token hash we can verify server-side (no PKCE verifier needed,
      // so it survives opening the email in another browser).
      const tokenHash = url.searchParams.get("token_hash")
      const type = url.searchParams.get("type")
      if (tokenHash && type) {
        router.replace(`/auth/confirm?token_hash=${tokenHash}&type=${type}&next=${encodeURIComponent(next)}`)
        return
      }

      // Default Supabase template: tokens arrive in the fragment.
      const accessToken = hash.get("access_token")
      const refreshToken = hash.get("refresh_token")
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          console.error("setSession failed:", error.message)
          await fail(error.message)
          return
        }
        // Clear the tokens from the address bar, then let the server see the cookies.
        window.history.replaceState(null, "", url.pathname)
        succeed()
        return
      }

      // PKCE flow (OAuth or a template using {{ .ConfirmationURL }} with ?code=).
      const code = url.searchParams.get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error("exchangeCodeForSession failed:", error.message)
          await fail(error.message)
          return
        }
        succeed()
        return
      }

      // No recognizable params. The session may already be set (fragment stripped
      // by an upstream redirect, or the tab was reopened) — only error when there
      // is genuinely no session to fall back on.
      await fail("missing_token")
    }

    void complete()
  }, [router])

  return (
    <AuthShell title={t.auth.confirmingTitle} subtitle={failed ? undefined : t.auth.confirmingBody}>
      <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
        {t.auth.confirmingWait}
      </div>
    </AuthShell>
  )
}
