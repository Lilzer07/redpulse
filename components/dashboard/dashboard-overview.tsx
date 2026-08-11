"use client"

import { motion } from "framer-motion"
import { Radio, Sparkles, Flame, Trophy, Send, ArrowUpRight } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { AlertsFeed } from "@/components/dashboard/alerts-feed"
import { IntegrationStatus, type IntegrationStatusView } from "@/components/dashboard/integration-status"
import { ButtonLink } from "@/components/ui/button-link"
import { useI18n } from "@/lib/i18n/context"
import type { Alert, DashboardStats } from "@/lib/user-data"

export function DashboardOverview({
  stats,
  alerts,
  integration,
}: {
  stats: DashboardStats
  alerts: Alert[]
  integration: IntegrationStatusView
}) {
  const { t } = useI18n()
  const s = t.dashboard.stats

  return (
    <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
      {/* Stat grid — every figure is computed from this account's own rows. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label={s.alerts.label}
          value={String(stats.alertCount)}
          icon={Radio}
          accent="green"
          hint={s.alerts.hint}
          delay={0}
        />
        <StatCard
          label={s.week.label}
          value={String(stats.last7Days)}
          icon={Sparkles}
          accent="green"
          hint={s.week.hint}
          delay={0.06}
        />
        <StatCard
          label={s.confidence.label}
          value={stats.avgImpact === null ? "—" : `${stats.avgImpact}/100`}
          icon={Flame}
          accent="red"
          hint={s.confidence.hint}
          delay={0.12}
        />
        <StatCard
          label={s.competitions.label}
          value={String(stats.competitionCount)}
          icon={Trophy}
          accent="green"
          hint={s.competitions.hint}
          delay={0.18}
        />
        <StatCard
          label={s.telegram.label}
          value={stats.telegramConnected ? s.telegram.connected : s.telegram.disconnected}
          icon={Send}
          accent="green"
          hint={s.telegram.hint}
          delay={0.24}
        />
      </div>

      {/* Real state of the monitoring pipeline that produces the alerts above. */}
      <IntegrationStatus status={integration} />

      {/* Alerts feed */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-3xl border border-white/8 bg-white/[0.015] p-5 lg:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <h2 className="text-base font-semibold text-foreground">{t.dashboard.liveTitle}</h2>
          </div>
          <ButtonLink
            href="/dashboard/live"
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t.dashboard.seeAll}
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </ButtonLink>
        </div>

        <AlertsFeed alerts={alerts} hasCompetitions={stats.competitionCount > 0} />
      </motion.section>
    </div>
  )
}
