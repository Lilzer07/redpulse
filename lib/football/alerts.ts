// Per-user alert history.
//
// The dashboard reads `alerts` scoped to the signed-in user, so a detected
// expulsion has to be written here for each entitled subscriber. Writes go
// through the service-role client because the monitoring loop runs without a
// user session.
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { competitionById } from "./competitions"
import type { RedCardAnalysis, RedCardEvent } from "./types"

/**
 * Records one alert row for one user.
 *
 * `delivered_at` is set only when Telegram actually accepted the message, so the
 * feed distinguishes "alert generated" from "alert delivered" instead of implying
 * a send that never happened.
 */
export async function recordUserAlert(input: {
  userId: string
  event: RedCardEvent
  analysis: RedCardAnalysis
  deliveredAt: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false, error: "Service role key is not configured." }

  const { event, analysis } = input
  const competition = competitionById(event.leagueId)

  const { error } = await supabase.from("alerts").insert({
    user_id: input.userId,
    // The dashboard filters by the catalogue slug, so store that rather than the
    // numeric API id.
    competition_id: competition?.slug ?? String(event.leagueId),
    competition: event.leagueName,
    home_team: event.homeTeam,
    away_team: event.awayTeam,
    score: `${event.homeScore}-${event.awayScore}`,
    minute: event.minute,
    player: event.player,
    carded_team: event.team,
    favorite: analysis.favorite,
    extra_goal_prob: analysis.extraGoalProb,
    favorite_win_prob: analysis.favoriteWinProb,
    impact: analysis.confidence,
    delivered_at: input.deliveredAt,
  })

  return error ? { ok: false, error: error.message } : { ok: true }
}
