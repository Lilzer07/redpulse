"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2, Send, KeyRound, Hash } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"

type Status = "idle" | "testing" | "connected"

export default function TelegramPage() {
  const [token, setToken] = useState("")
  const [chatId, setChatId] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  const canTest = token.trim().length > 0 && chatId.trim().length > 0

  function testConnection() {
    if (!canTest || status === "testing") return
    setStatus("testing")
    // Simulated round-trip — swap for a real Telegram getMe / sendMessage call.
    setTimeout(() => setStatus("connected"), 1600)
  }

  return (
    <>
      <Topbar title="Telegram" subtitle="Connectez votre bot pour recevoir les alertes." />

      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Send className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Configuration du bot</h2>
                <p className="text-sm text-muted-foreground">Collez les identifiants fournis par @BotFather.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium text-foreground">
                  Token du bot Telegram
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="token"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      setStatus("idle")
                    }}
                    placeholder="123456789:AAE_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="h-12 w-full rounded-xl border border-white/8 bg-background/60 pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="chatid" className="text-sm font-medium text-foreground">
                  Chat ID
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="chatid"
                    value={chatId}
                    onChange={(e) => {
                      setChatId(e.target.value)
                      setStatus("idle")
                    }}
                    placeholder="-1001234567890"
                    className="h-12 w-full rounded-xl border border-white/8 bg-background/60 pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
                  />
                </div>
              </div>

              <button
                onClick={testConnection}
                disabled={!canTest || status === "testing"}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "testing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Test en cours…
                  </>
                ) : (
                  "Tester la connexion"
                )}
              </button>

              <AnimatePresence>
                {status === "connected" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, height: 0 }}
                    animate={{ opacity: 1, scale: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.08] px-4 py-3"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                    <p className="text-sm font-medium text-primary">Telegram connecté avec succès.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Help card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-7"
          >
            <h3 className="font-semibold text-foreground">Comment obtenir vos identifiants</h3>
            <ol className="mt-4 space-y-4">
              {[
                "Ouvrez Telegram et démarrez une conversation avec @BotFather.",
                "Envoyez /newbot puis suivez les instructions pour créer votre bot.",
                "Copiez le token fourni et collez-le dans le champ à gauche.",
                "Récupérez votre Chat ID via @userinfobot et collez-le également.",
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{text}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    </>
  )
}
