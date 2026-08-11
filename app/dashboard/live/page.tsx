import { Topbar } from "@/components/dashboard/topbar"
import { AlertsFeed } from "@/components/dashboard/alerts-feed"
import { getAlerts, getEnabledCompetitionIds } from "@/lib/user-data"

export default async function LivePage() {
  const [alerts, enabledIds] = await Promise.all([getAlerts(50), getEnabledCompetitionIds()])

  return (
    <>
      <Topbar section="live" />
      <div className="px-5 py-6 lg:px-8">
        <AlertsFeed alerts={alerts} hasCompetitions={enabledIds.length > 0} />
      </div>
    </>
  )
}
