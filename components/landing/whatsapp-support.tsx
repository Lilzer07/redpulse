"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

/**
 * International form for the wa.me deep link (no +, spaces or leading 0).
 * The number is intentionally never rendered on screen — only used inside the
 * WhatsApp link so it stays hidden from visitors.
 */
const PHONE_E164 = "33685706525"

/** Official WhatsApp glyph — brand icon, kept as a single inline path. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.59 4.46 1.71 6.4L3.2 28.8l6.57-1.68a12.74 12.74 0 0 0 6.23 1.62h.005c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8Zm0 23.02h-.004a10.6 10.6 0 0 1-5.4-1.48l-.386-.23-4.003 1.024 1.07-3.902-.252-.4a10.56 10.56 0 0 1-1.62-5.652c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.108 7.52 3.117a10.56 10.56 0 0 1 3.116 7.52c0 5.865-4.77 10.635-10.63 10.635Zm5.83-7.96c-.32-.16-1.89-.933-2.183-1.04-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.57-1.586-.95-.847-1.59-1.893-1.777-2.213-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.987-2.374-.26-.623-.523-.538-.72-.548l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667 0 1.573 1.146 3.093 1.306 3.307.16.213 2.253 3.44 5.46 4.826.763.33 1.36.527 1.824.674.767.244 1.464.21 2.016.127.615-.092 1.89-.773 2.157-1.52.267-.746.267-1.386.187-1.52-.08-.133-.293-.213-.613-.373Z" />
    </svg>
  )
}

export function WhatsAppSupport() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const w = t.whatsapp

  const waHref = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(w.prefill)}`

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-3">
      {/* Expandable card */}
      {open && (
        <div
          role="dialog"
          aria-label={w.label}
          className="glass w-[min(20rem,calc(100vw-2rem))] rounded-3xl p-4 shadow-2xl duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppGlyph className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{w.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground text-pretty">{w.tagline}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={w.close}
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[rgb(var(--overlay)/0.08)] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            <WhatsAppGlyph className="h-5 w-5" />
            {w.cta}
          </a>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? w.close : w.open}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" aria-hidden="true" />
        )}
        <span className="relative">
          {open ? <X className="h-6 w-6" /> : <WhatsAppGlyph className="h-7 w-7" />}
        </span>
      </button>
    </div>
  )
}
