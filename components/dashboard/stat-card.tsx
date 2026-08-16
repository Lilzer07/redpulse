"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

type Props = {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  accent?: "green" | "red" | "neutral"
  delay?: number
}

const accentMap = {
  green: "text-primary bg-primary/10",
  red: "text-[var(--danger)] bg-[var(--danger)]/10",
  neutral: "text-foreground bg-[rgb(var(--overlay)/0.05)]",
}

export function StatCard({ label, value, icon: Icon, hint, accent = "neutral", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[rgb(var(--overlay)/0.08)] bg-[rgb(var(--overlay)/0.02)] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentMap[accent]}`}>
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 break-words text-balance text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </motion.div>
  )
}
