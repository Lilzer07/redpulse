import { Topbar } from "@/components/dashboard/topbar"
import { LiveFeed } from "@/components/dashboard/live-feed"

export default function LivePage() {
  return (
    <>
      <Topbar
        title="Flux en direct"
        subtitle="Chaque carton rouge détecté apparaît ici en temps réel."
      />
      <div className="px-5 py-6 lg:px-8">
        <LiveFeed max={12} intervalMs={4000} />
      </div>
    </>
  )
}
