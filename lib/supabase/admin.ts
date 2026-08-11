// Service-role Supabase client, for server-side monitoring work only.
//
// The monitoring tables (red_card_events, monitor_state) have RLS enabled with no
// permissive policy, so they are reachable only through this client. That is
// deliberate: a red card is a global fact owned by the server, and a browser
// holding the anon key must not be able to read, forge or replay one.
//
// `server-only` guarantees a build error if this module is ever pulled into a
// Client Component, which would leak the service-role key.
import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cached: SupabaseClient | null = null

/**
 * Returns the shared service-role client, or null when the key is not
 * configured. Callers must handle null rather than assume availability, so a
 * missing key degrades the monitor instead of crashing the whole app.
 */
export function createAdminClient(): SupabaseClient | null {
  if (cached) return cached

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
