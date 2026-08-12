import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Server-side key/value config, used for values the app provisions for itself at
 * runtime (e.g. the Stripe webhook signing secret) instead of asking the user to
 * paste them into the dashboard.
 *
 * The backing table has RLS enabled with no policy, so only the service role can
 * read it. Values are secrets: never return them to the browser.
 */

/** Reads a config value. Returns null when unset or when storage is unavailable. */
export async function getConfigValue(key: string): Promise<string | null> {
  const admin = createAdminClient()
  if (!admin) return null

  const { data, error } = await admin.from("app_config").select("value").eq("key", key).maybeSingle()

  if (error || !data) return null
  const value = typeof data.value === "string" ? data.value.trim() : ""
  return value.length > 0 ? value : null
}

/** Stores a config value, overwriting any previous one. Returns false on failure. */
export async function setConfigValue(key: string, value: string): Promise<boolean> {
  const admin = createAdminClient()
  if (!admin) return false

  const { error } = await admin.from("app_config").upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  )

  return !error
}
