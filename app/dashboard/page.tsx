import { Topbar } from "@/components/dashboard/topbar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { getAlerts, getDashboardStats } from "@/lib/user-data"
import { getIntegrationStatus } from "@/lib/football/health"

export default async function DashboardPage() {
  // Everything below belongs to the signed-in user only, except the integration
  // status, which reports the shared monitoring pipeline's real health.
  const [stats, alerts, integration] = await Promise.all([
    getDashboardStats(),
    getAlerts(8),
    getIntegrationStatus(),
  ])

  return (
    <>
      <Topbar section="dashboard" />
      <DashboardOverview stats={stats} alerts={alerts} integration={integration} />
    </>
  )
}
