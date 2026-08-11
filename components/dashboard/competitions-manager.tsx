"use client"

import { useMemo, useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Search, Shield } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { competitions, type Competition } from "@/lib/data"
import { useI18n } from "@/lib/i18n/context"
import { setAllCompetitions, setCompetitionEnabled } from "@/app/dashboard/actions"

// Official league badge with a discreet placeholder fallback (no initials).
function CompetitionBadge({ c }: { c: Competition }) {
  const [failed, setFailed] = useState(false)
  const showLogo = Boolean(c.logo) && !failed

  if (showLogo) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.logo as string}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          width={44}
          height={44}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      </span>
    )
  }

  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/10"
      aria-hidden
    >
      <Shield className="h-5 w-5 text-muted-foreground" />
    </span>
  )
}

const tierOrder: Competition["tier"][] = ["league", "european", "cup"]

/**
 * `enabledIds` comes from the signed-in user's own rows. Toggles write straight
 * back to their account, so selections survive a reload and never leak between
 * users.
 */
export function CompetitionsManager({ enabledIds }: { enabledIds: string[] }) {
  const { t } = useI18n()
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(competitions.map((c) => [c.id, enabledIds.includes(c.id)])),
  )
  const [query, setQuery] = useState("")
  const [, startTransition] = useTransition()

  const activeCount = useMemo(() => Object.values(enabled).filter(Boolean).length, [enabled])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return competitions
    return competitions.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
    )
  }, [query])

  const groups = useMemo(() => {
    return tierOrder
      .map((tier) => ({
        tier,
        items: filtered.filter((c) => c.tier === tier),
      }))
      .filter((g) => g.items.length > 0)
  }, [filtered])

  const allOn = activeCount === competitions.length

  function toggle(id: string) {
    const next = !enabled[id]
    // Optimistic flip, then persist; revert if the write is refused.
    setEnabled((prev) => ({ ...prev, [id]: next }))
    startTransition(async () => {
      const res = await setCompetitionEnabled(id, next)
      if (!res.ok) setEnabled((prev) => ({ ...prev, [id]: !next }))
    })
  }

  function toggleAll() {
    const next = !allOn
    const previous = enabled
    setEnabled(Object.fromEntries(competitions.map((c) => [c.id, next])))
    startTransition(async () => {
      const res = await setAllCompetitions(next)
      if (!res.ok) setEnabled(previous)
    })
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.competitions.search}
            className="h-11 w-full rounded-xl border border-white/8 bg-white/[0.02] pl-10 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2.5 sm:justify-start">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{activeCount}</span> / {competitions.length}{" "}
            {t.competitions.active}
          </span>
          <button
            onClick={toggleAll}
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {allOn ? t.competitions.disableAll : t.competitions.enableAll}
          </button>
        </div>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.tier} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.competitions.tiers[group.tier]}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((c, i) => {
                const on = enabled[c.id]
                return (
                  <motion.label
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
                      on
                        ? "border-primary/25 bg-primary/[0.06]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/15"
                    }`}
                  >
                    <CompetitionBadge c={c} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{c.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.country}</span>
                    </span>
                    <Switch
                      checked={on}
                      onCheckedChange={() => toggle(c.id)}
                      aria-label={`${t.competitions.alertsFor} ${c.name}`}
                    />
                  </motion.label>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
