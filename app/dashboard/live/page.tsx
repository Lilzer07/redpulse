"use client"

import { Topbar } from "@/components/dashboard/topbar"
import { LiveFeed } from "@/components/dashboard/live-feed"
import { useI18n } from "@/lib/i18n/context"

export default function LivePage() {
  const { t } = useI18n()

  return (
    <>
      <Topbar title={t.live.title} subtitle={t.live.subtitle} />
      <div className="px-5 py-6 lg:px-8">
        <LiveFeed max={12} intervalMs={4000} />
      </div>
    </>
  )
}
