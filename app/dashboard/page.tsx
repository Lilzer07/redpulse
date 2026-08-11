"use client"

import { motion } from "framer-motion"
import { Radio, Sparkles, Flame, Timer, Send, ArrowUpRight } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/dashboard/stat-card"
import { LiveFeed } from "@/components/dashboard/live-feed"
import { ButtonLink } from "@/components/ui/button-link"
import { useI18n } from "@/lib/i18n/context"

export default function DashboardPage() {
  const { t } = useI18n()
  const s = t.dashboard.stats

  return (
    <>
      <Topbar title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label={s.matches.label} value="37" icon={Radio} accent="green" hint={s.matches.hint} delay={0} />
          <StatCard label={s.analyses.label} value="12" icon={Sparkles} accent="green" hint={s.analyses.hint} delay={0.06} />
          <StatCard label={s.confidence.label} value="78/100" icon={Flame} accent="red" hint={s.confidence.hint} delay={0.12} />
          <StatCard label={s.avgTime.label} value={s.avgTime.value} icon={Timer} accent="green" hint={s.avgTime.hint} delay={0.18} />
          <StatCard label={s.telegram.label} value={s.telegram.value} icon={Send} accent="green" hint={s.telegram.hint} delay={0.24} />
        </div>

        {/* Live feed */}
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

          <LiveFeed intervalMs={4000} max={8} />
        </motion.section>
      </div>
    </>
  )
}
