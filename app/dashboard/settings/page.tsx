"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Topbar } from "@/components/dashboard/topbar"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/lib/i18n/context"
import { useSession } from "@/lib/session-context"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { updateProfile } from "@/app/dashboard/actions"

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
const notifIds = ["instant", "digest", "product"] as const

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const { email, profile, displayName } = useSession()
  // Seeded from this user's own profile row, not from shared defaults.
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    instant: profile?.notify_instant ?? true,
    digest: profile?.notify_digest ?? false,
    product: profile?.notify_product ?? true,
  })
  const [timezone, setTimezone] = useState(profile?.timezone ?? "Europe/Paris")
  const [darkMode, setDarkMode] = useState(true)
  const [name, setName] = useState(displayName ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // After a save the layout re-renders with the stored profile; adopt it so the
  // field shows what was actually persisted rather than stale local input.
  const [syncedName, setSyncedName] = useState(displayName)
  if (displayName !== syncedName) {
    setSyncedName(displayName)
    setName(displayName ?? "")
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const result = await updateProfile({
      displayName: name,
      timezone,
      notifyInstant: prefs.instant,
      notifyDigest: prefs.digest,
      notifyProduct: prefs.product,
    })
    setSaving(false)
    if (result.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <>
      <Topbar section="settings" />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6 lg:px-8">
        <Section title={t.settings.profile.title} description={t.settings.profile.description}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">{t.settings.name}</label>
              {/* The real profile name for this account, blank until the user sets one. */}
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.settings.namePlaceholder}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">{t.settings.email}</label>
              {/* The email identifies the Supabase account, so it is not editable here. */}
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className={`${fieldClass} cursor-not-allowed text-muted-foreground`}
              />
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
              {/* IANA names, matching what the profile row stores. */}
              <select
                id="tz"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={fieldClass}
              >
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                <option value="Europe/Rome">Europe/Rome (GMT+1)</option>
                <option value="Europe/Lisbon">Europe/Lisbon (GMT)</option>
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
            {notifIds.map((id, i) => (
              <label
                key={id}
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
                  checked={prefs[id]}
                  onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [id]: v }))}
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

        {/* Reachable on every viewport — the sidebar sign-out is desktop-only. */}
        <Section title={t.settings.account.title} delay={0.24}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t.settings.account.signedInAs} <span className="font-medium text-foreground">{email}</span>
            </p>
            <SignOutButton />
          </div>

          {/* Passwords are changed through the emailed reset link, never shown in a field. */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5">
            <div>
              <p className="font-medium text-foreground">{t.settings.password}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.settings.passwordDesc}</p>
            </div>
            <Link
              href="/auth/forgot-password"
              className="h-11 shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium leading-[2.75rem] text-foreground transition-colors hover:bg-white/[0.06]"
            >
              {t.settings.changePassword}
            </Link>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3">
          {saved ? <p className="text-sm text-primary">{t.settings.saved}</p> : null}
          <button
            onClick={() => setName(displayName ?? "")}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
          >
            {t.settings.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? t.settings.saving : t.settings.save}
          </button>
        </div>
      </div>
    </>
  )
}
