import { createClient } from "@/lib/supabase/server"
import { competitions } from "@/lib/data"

export type Profile = {
  display_name: string | null
  timezone: string
  locale: string
  notify_instant: boolean
  notify_digest: boolean
  notify_product: boolean
}

export type TelegramSettings = {
  bot_token: string | null
  chat_id: string | null
  verified_at: string | null
}

export type Alert = {
  id: string
  competition_id: string
  competition: string
  home_team: string
  away_team: string
  score: string
  minute: number
  player: string
  carded_team: string
  favorite: string
  extra_goal_prob: number
  favorite_win_prob: number
  impact: number
  delivered_at: string | null
  created_at: string
}

/**
 * Resolves the signed-in user, or null. Every reader below goes through this so
 * a missing session yields empty data instead of another account's rows.
 */
async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function getProfile(): Promise<Profile | null> {
  const { supabase, user } = await currentUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("display_name, timezone, locale, notify_instant, notify_digest, notify_product")
    .eq("id", user.id)
    .maybeSingle()

  return data ?? null
}

/**
 * Competition ids this user follows. A brand-new account follows none, so the
 * UI starts empty rather than pretending everything is monitored.
 */
export async function getEnabledCompetitionIds(): Promise<string[]> {
  const { supabase, user } = await currentUser()
  if (!user) return []

  const { data } = await supabase
    .from("user_competitions")
    .select("competition_id")
    .eq("user_id", user.id)
    .eq("enabled", true)

  const known = new Set(competitions.map((c) => c.id))
  return (data ?? []).map((r) => r.competition_id).filter((id) => known.has(id))
}

export async function getTelegramSettings(): Promise<TelegramSettings | null> {
  const { supabase, user } = await currentUser()
  if (!user) return null

  const { data } = await supabase
    .from("telegram_settings")
    .select("bot_token, chat_id, verified_at")
    .eq("user_id", user.id)
    .maybeSingle()

  return data ?? null
}

export async function getAlerts(limit = 20): Promise<Alert[]> {
  const { supabase, user } = await currentUser()
  if (!user) return []

  const { data } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  return data ?? []
}

export type DashboardStats = {
  alertCount: number
  last7Days: number
  avgImpact: number | null
  competitionCount: number
  telegramConnected: boolean
}

/** Aggregates the signed-in user's own numbers for the dashboard stat grid. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { supabase, user } = await currentUser()
  if (!user) {
    return { alertCount: 0, last7Days: 0, avgImpact: null, competitionCount: 0, telegramConnected: false }
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ count: alertCount }, { count: last7Days }, { data: impacts }, { count: competitionCount }, telegram] =
    await Promise.all([
      supabase.from("alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", weekAgo),
      supabase.from("alerts").select("impact").eq("user_id", user.id),
      supabase
        .from("user_competitions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("enabled", true),
      getTelegramSettings(),
    ])

  const rows = impacts ?? []
  const avgImpact = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + (r.impact as number), 0) / rows.length)
    : null

  return {
    alertCount: alertCount ?? 0,
    last7Days: last7Days ?? 0,
    avgImpact,
    competitionCount: competitionCount ?? 0,
    telegramConnected: Boolean(telegram?.verified_at),
  }
}
