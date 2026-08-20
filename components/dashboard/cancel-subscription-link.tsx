"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cancelSubscription } from "@/app/dashboard/actions"
import { useI18n } from "@/lib/i18n/context"

/**
 * Deliberately low-key subscription cancellation.
 *
 * Rendered as a small muted text link at the very bottom of the account
 * section, so it never competes with the primary settings. Clicking reveals an
 * inline confirmation rather than firing straight away, because cancellation is
 * irreversible-feeling for the user and cuts access immediately.
 */
export function CancelSubscriptionLink() {
  const { t } = useI18n()
  const a = t.settings.account
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleCancel() {
    setStatus("pending")
    const result = await cancelSubscription()
    if (result.ok) {
      setStatus("done")
      setMessage(a.cancelDone)
      setConfirming(false)
      router.refresh()
      return
    }
    setStatus("error")
    setMessage(result.error === "no_subscription" ? a.cancelNone : a.cancelError)
  }

  if (status === "done") {
    return <p className="mt-6 text-center text-xs text-muted-foreground">{message}</p>
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      {confirming ? (
        <>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{a.cancelConfirm}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              disabled={status === "pending"}
              className="text-xs font-medium text-[var(--danger)] underline-offset-4 transition-opacity hover:underline disabled:opacity-50"
            >
              {status === "pending" ? a.cancelPending : a.cancelSub}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={status === "pending"}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {a.keep}
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => {
            setConfirming(true)
            setStatus("idle")
          }}
          className="text-xs text-muted-foreground/70 underline-offset-4 transition-colors hover:text-[var(--danger)] hover:underline"
        >
          {a.cancelSub}
        </button>
      )}
      {status === "error" ? <p className="text-xs text-[var(--danger)]">{message}</p> : null}
    </div>
  )
}
