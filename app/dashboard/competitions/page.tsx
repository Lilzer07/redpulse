import { Topbar } from "@/components/dashboard/topbar"
import { CompetitionsManager } from "@/components/dashboard/competitions-manager"
import { getEnabledCompetitionIds } from "@/lib/user-data"

export default async function CompetitionsPage() {
  // Read on the server from the signed-in user's own rows.
  const enabledIds = await getEnabledCompetitionIds()

  return (
    <>
      <Topbar section="competitions" />
      <CompetitionsManager enabledIds={enabledIds} />
    </>
  )
}
