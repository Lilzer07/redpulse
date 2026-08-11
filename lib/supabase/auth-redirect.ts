/**
 * Builds the URL Supabase sends users to after an email link (sign-up
 * confirmation, password reset).
 *
 * This MUST match the origin the browser client set its PKCE verifier cookie on
 * when the link was requested. If it doesn't, `exchangeCodeForSession` can't find
 * the verifier and fails with "invalid or expired" — even though GoTrue already
 * confirmed the account server-side (which is why a manual login then works).
 *
 * `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is the v0 preview's redirect proxy: it
 * only exists so auth links can reach the sandboxed dev VM. It is a build-time
 * `NEXT_PUBLIC_` value, so it also gets inlined into the production bundle — using
 * it there would send real users (on https://red-match.com) through the dev
 * proxy. So we only honor it outside production; in production we always use the
 * live page origin.
 */
export function authCallbackUrl(next?: string): string {
  const useDevProxy =
    process.env.NODE_ENV !== "production" && !!process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL

  const base = useDevProxy
    ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL!
    : `${window.location.origin}/auth/callback`

  if (!next) return base
  const separator = base.includes("?") ? "&" : "?"
  return `${base}${separator}next=${encodeURIComponent(next)}`
}
