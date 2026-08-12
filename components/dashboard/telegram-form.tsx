"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2, Send, Link2, AlertTriangle, Copy, LogOut, Lock } from "lucide-react"
import { startTelegramLinking, disconnectTelegram, sendTestAlert } from "@/app/dashboard/actions"

type Props = {
  /** True when the chat is linked and access is active. */
  connected: boolean
  /** True when the account holds an active/entitled subscription. */
  subscriptionActive: boolean
}

/**
 * Telegram connection panel, single shared bot model. There is no token input:
 * connecting mints a deep link the user opens in Telegram, and all trust
 * decisions happen on the server.
 */
export function TelegramForm({ connected, subscriptionActive }: Props) {
  // --- State 3: subscription inactive -> linking is not offered at all -------
  if (!subscriptionActive) {
    return (
      <Panel>
        <Header
          icon={<Lock className="h-5 w-5" />}
          title="Alertes en pause"
          subtitle="La connexion Telegram nécessite un abonnement actif."
        />
        <div className="flex items-start gap-3 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/[0.07] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {
              "Votre abonnement n'est pas actif. Réactivez-le pour connecter Telegram et recevoir vos alertes carton rouge en temps réel."
            }
          </p>
        </div>
      </Panel>
    )
  }

  // --- State 1: connected -> status + test + disconnect ----------------------
  if (connected) {
    return <ConnectedPanel />
  }

  // --- State 2: not connected (but entitled) -> generate a deep link ---------
  return <ConnectPanel />
}

function ConnectPanel() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [deepLink, setDeepLink] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)

  async function connect() {
    setStatus("loading")
    setError("")
    const res = await startTelegramLinking()
    if (res.ok) {
      setDeepLink(res.deepLink)
      setStatus("ready")
    } else {
      setError(
        res.error === "not_configured" || res.error === "bot_unreachable"
          ? "Le bot Telegram n'est pas encore configuré côté serveur. Réessayez plus tard."
          : "Impossible de générer le lien de connexion. Réessayez.",
      )
      setStatus("error")
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(deepLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard denied: the visible link stays selectable as a fallback.
    }
  }

  return (
    <Panel>
      <Header
        icon={<Send className="h-5 w-5" />}
        title="Connecter Telegram"
        subtitle="Un seul bot RedMatch, aucune configuration technique."
      />

      <ol className="mb-5 space-y-3">
        {[
          "Cliquez sur « Générer le lien de connexion ».",
          "Ouvrez le lien : il lance une conversation avec le bot RedMatch.",
          "Appuyez sur « Démarrer » dans Telegram pour lier ce compte.",
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>

      {status !== "ready" && (
        <button
          onClick={connect}
          disabled={status === "loading"}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération…
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Générer le lien de connexion
            </>
          )}
        </button>
      )}

      <AnimatePresence>
        {status === "ready" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
              Ouvrir dans Telegram
            </a>
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-background/60 px-3 py-2">
              <span className="truncate text-xs text-muted-foreground">{deepLink}</span>
              <button
                onClick={copy}
                className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Ce lien expire dans 15 minutes.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {status === "error" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/[0.08] px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
          <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
        </div>
      )}
    </Panel>
  )
}

function ConnectedPanel() {
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle")
  const [disconnecting, setDisconnecting] = useState(false)

  async function test() {
    setTestStatus("sending")
    const res = await sendTestAlert()
    setTestStatus(res.ok ? "sent" : "failed")
    if (res.ok) setTimeout(() => setTestStatus("idle"), 4000)
  }

  async function disconnect() {
    setDisconnecting(true)
    await disconnectTelegram()
    // The server revalidates /dashboard/telegram, so the page re-renders in the
    // disconnected state on its own.
  }

  return (
    <Panel>
      <Header
        icon={<Check className="h-5 w-5" />}
        title="Telegram connecté"
        subtitle="Vos alertes carton rouge arrivent en temps réel."
      />

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.08] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-4 w-4" />
        </span>
        <p className="text-sm font-medium text-primary">Ce compte est lié et actif.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={test}
          disabled={testStatus === "sending"}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {testStatus === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Envoyer un test
            </>
          )}
        </button>
        <button
          onClick={disconnect}
          disabled={disconnecting}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-base font-semibold text-foreground transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Déconnecter
        </button>
      </div>

      <AnimatePresence>
        {testStatus === "sent" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 text-sm font-medium text-primary"
          >
            Message de test envoyé. Vérifiez votre Telegram.
          </motion.p>
        )}
        {testStatus === "failed" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 text-sm font-medium text-[var(--danger)]"
          >
            {"L'envoi a échoué. Le bot n'est peut-être pas encore configuré côté serveur."}
          </motion.p>
        )}
      </AnimatePresence>
    </Panel>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 lg:p-8"
    >
      {children}
    </motion.div>
  )
}

function Header({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">{icon}</span>
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
