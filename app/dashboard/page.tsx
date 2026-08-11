import { Topbar } from "@/components/dashboard/topbar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { getAlerts, getDashboardStats } from "@/lib/user-data"

export default async function DashboardPage() {
  // Everything below belongs to the signed-in user only.
  const [stats, alerts] = await Promise.all([getDashboardStats(), getAlerts(8)])

  return (
    <>
      <Topbar section="dashboard" />
      <DashboardOverview stats={stats} alerts={alerts} />
    </>
  )
}
