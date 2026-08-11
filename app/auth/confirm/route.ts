import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

/**
 * Primary confirmation endpoint, used by the branded RedPulse email.
 *
 * The email link carries `token_hash` (Supabase's `{{ .TokenHash }}`) rather than
 * relying on Supabase's own /auth/v1/verify redirect. That matters because verify
 * returns the session in the URL *fragment*, which browsers never send to the
 * server -- so a server route can't read it. Verifying the hash here keeps the
 * whole exchange server-side and works even when the user opens the email in a
 * different browser than the one they signed up in (no PKCE verifier needed).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  // A recovery link must land on the form that sets a new password, not the app.
  const fallback = type === "recovery" ? "/auth/reset-password" : "/dashboard"
  const next = searchParams.get("next") ?? fallback

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_token`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    console.error("verifyOtp failed:", error.message)
    return NextResponse.redirect(`${origin}/auth/error?reason=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
