"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Topbar } from "@/components/dashboard/topbar"
import { Switch } from "@/components/ui/switch"

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

const notifPrefs = [
  { id: "instant", label: "Alertes instantanées", desc: "Notification dès qu’un carton rouge est distribué.", on: true },
  { id: "digest", label: "Résumé quotidien", desc: "Un récapitulatif des cartons du jour à 22h.", on: false },
  { id: "product", label: "Nouveautés produit", desc: "Nouvelles compétitions et fonctionnalités.", on: true },
]

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifPrefs.map((p) => [p.id, p.on])),
  )
  const [darkMode, setDarkMode] = useState(true)

  return (
    <>
      <Topbar title="Paramètres" subtitle="Gérez votre profil et vos préférences." />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6 lg:px-8">
        <Section title="Profil" description="Vos informations personnelles.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Nom</label>
              <input id="name" defaultValue="Martin Bernard" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Adresse e-mail</label>
              <input id="email" type="email" defaultValue="martin@redpulse.io" className={fieldClass} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe</label>
              <input id="password" type="password" defaultValue="password" className={fieldClass} />
            </div>
          </div>
        </Section>

        <Section title="Préférences régionales" description="Langue et fuseau horaire." delay={0.06}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="lang" className="text-sm font-medium text-foreground">Langue</label>
              <select id="lang" defaultValue="fr" className={fieldClass}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="it">Italiano</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="tz" className="text-sm font-medium text-foreground">Fuseau horaire</label>
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

        <Section title="Préférences des notifications" description="Choisissez ce que vous recevez." delay={0.12}>
          <div className="space-y-1">
            {notifPrefs.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <span>
                  <span className="block font-medium text-foreground">{p.label}</span>
                  <span className="block text-sm text-muted-foreground">{p.desc}</span>
                </span>
                <Switch
                  checked={prefs[p.id]}
                  onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [p.id]: v }))}
                  aria-label={p.label}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Apparence" delay={0.18}>
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block font-medium text-foreground">Mode sombre</span>
              <span className="block text-sm text-muted-foreground">RedPulse est optimisé pour le mode sombre.</span>
            </span>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Mode sombre" />
          </label>
        </Section>

        <div className="flex justify-end gap-3">
          <button className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]">
            Annuler
          </button>
          <button className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </>
  )
}
