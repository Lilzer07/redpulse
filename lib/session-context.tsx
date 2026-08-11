"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Profile } from "@/lib/user-data"

type SessionValue = {
  email: string
  /** The signed-in user's own profile row, or null if it has not loaded. */
  profile: Profile | null
  displayName: string | null
}

const SessionContext = createContext<SessionValue | null>(null)

/**
 * Makes the server-verified session user available to client components inside
 * the dashboard, so they never have to re-fetch it on the client.
 */
export function SessionProvider({
  email,
  profile,
  children,
}: {
  email: string
  profile: Profile | null
  children: ReactNode
}) {
  return (
    <SessionContext.Provider value={{ email, profile, displayName: profile?.display_name ?? null }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside a SessionProvider")
  return ctx
}
