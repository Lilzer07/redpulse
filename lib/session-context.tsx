"use client"

import { createContext, useContext, type ReactNode } from "react"

type SessionValue = { email: string }

const SessionContext = createContext<SessionValue | null>(null)

/**
 * Makes the server-verified session user available to client components inside
 * the dashboard, so they never have to re-fetch it on the client.
 */
export function SessionProvider({ email, children }: { email: string; children: ReactNode }) {
  return <SessionContext.Provider value={{ email }}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside a SessionProvider")
  return ctx
}
