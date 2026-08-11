"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Topbar } from "@/components/dashboard/topbar"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/lib/i18n/context"

function Section({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string
  description?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-7"
    >
      <div className="mb-5">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </motion.section>
  )
}

const fieldClass =
  "h-12 w-full rounded-xl border border-white/8 bg-background/60 px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"

// Index-aligned with `settings.notifications.items` in the dictionaries.
const notifPrefs = [
  { id: "instant", on: true },
  { id: "digest", on: false },
  { id: "product", on: true },
]

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifPrefs.map((p) => [p.id, p.on])),
  )
  const [darkMode, setDarkMode] = useState(true)

  return (
    <>
      <Topbar title={t.settings.title} subtitle={t.settings.subtitle} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6 lg:px-8">
        <Section title={t.settings.profile.title} description={t.settings.profile.description}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">{t.settings.name}</label>
              <input id="name" defaultValue="Martin Bernard" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">{t.settings.email}</label>
              <input id="email" type="email" defaultValue="martin@redpulse.io" className={fieldClass} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">{t.settings.password}</label>
              <input id="password" type="password" defaultValue="password" className={fieldClass} />
            </div>
          </div>
        </Section>

        <Section title={t.settings.regional.title} description={t.settings.regional.description} delay={0.06}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="lang" className="text-sm font-medium text-foreground">{t.settings.language}</label>
              {/* Bound to the real i18n state, so it stays in sync with the header switcher. */}
              <select
                id="lang"
                value={locale}
                onChange={(e) => setLocale(e.target.value as typeof locale)}
                className={fieldClass}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="tz" className="text-sm font-medium text-foreground">{t.settings.timezone}</label>
              <select id="tz" defaultValue="paris" className={fieldClass}>
                <option value="paris">Europe/Paris (GMT+1)</option>
                <option value="london">Europe/London (GMT)</option>
                <option value="madrid">Europe/Madrid (GMT+1)</option>
                <option value="rome">Europe/Rome (GMT+1)</option>
                <option value="lisbon">Europe/Lisbon (GMT)</option>
              </select>
            </div>
          </div>
        </Section>

        <Section
          title={t.settings.notifications.title}
          description={t.settings.notifications.description}
          delay={0.12}
        >
          <div className="space-y-1">
            {notifPrefs.map((p, i) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <span>
                  <span className="block font-medium text-foreground">
                    {t.settings.notifications.items[i].label}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {t.settings.notifications.items[i].desc}
                  </span>
                </span>
                <Switch
                  checked={prefs[p.id]}
                  onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [p.id]: v }))}
                  aria-label={t.settings.notifications.items[i].label}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title={t.settings.appearance.title} delay={0.18}>
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block font-medium text-foreground">{t.settings.darkMode}</span>
              <span className="block text-sm text-muted-foreground">{t.settings.darkModeDesc}</span>
            </span>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label={t.settings.darkMode} />
          </label>
        </Section>

        <div className="flex justify-end gap-3">
          <button className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]">
            {t.settings.cancel}
          </button>
          <button className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
            {t.settings.save}
          </button>
        </div>
      </div>
    </>
  )
}
