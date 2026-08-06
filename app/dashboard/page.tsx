"use client"

import { motion } from "framer-motion"
import { Radio, Sparkles, Flame, Timer, Send, ArrowUpRight } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/dashboard/stat-card"
import { LiveFeed } from "@/components/dashboard/live-feed"
import { ButtonLink } from "@/components/ui/button-link"

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Votre copilote analyse les cartons rouges en direct." />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Matchs surveillés" value="37" icon={Radio} accent="green" hint="En direct maintenant" delay={0} />
          <StatCard label="Analyses IA aujourd’hui" value="12" icon={Sparkles} accent="green" hint="+3 vs hier" delay={0.06} />
          <StatCard label="Indice de confiance moyen" value="78/100" icon={Flame} accent="red" hint="Sur les cartons du jour" delay={0.12} />
          <StatCard label="Temps moyen d’analyse" value="1,4 s" icon={Timer} accent="green" hint="Détection → Telegram" delay={0.18} />
          <StatCard label="Statut Telegram" value="Connecté" icon={Send} accent="green" hint="@redpulse_bot" delay={0.24} />
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
              <h2 className="text-base font-semibold text-foreground">Analyses en direct</h2>
            </div>
            <ButtonLink
              href="/dashboard/live"
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Tout voir
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </ButtonLink>
          </div>

          <LiveFeed intervalMs={4000} max={8} />
        </motion.section>
      </div>
    </>
  )
}
