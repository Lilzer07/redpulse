"use client"

import { useState } from "react"
import { X } from "lucide-react"

const AFFILIATE_URL =
  "https://wlfdj.adsrv.eacdn.com/C.ashx?btag=a_1523b_108c_&affid=724&siteid=1523&adid=108&c="

const IMAGE_URLS = [
  "https://drive.google.com/thumbnail?id=1g55s3HmWAV7GWN68fNhjKtmIJndC5j6c&sz=w1600",
  "https://drive.google.com/thumbnail?id=1bgQSU9qrAX9L1AlYv0Yh9wXLMs5_Y4mv&sz=w1600",
  "https://drive.google.com/thumbnail?id=1stRUh9bc2CAdU4Ugj9lLk9EENPDRUONK&sz=w1600",
  "https://drive.google.com/thumbnail?id=1Fm0x2UL4JLuGx0qo_SKe0_7BqWpYHZJ_&sz=w1600",
]

export function UnibetBanner({ placement = "landing" }: { placement?: "landing" | "dashboard" }) {
  const [dismissed, setDismissed] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  if (dismissed) return null

  return (
    <aside
      aria-label="Publicité Unibet"
      className={placement === "dashboard" ? "px-4 py-4 sm:px-6 lg:px-8" : "mx-auto max-w-6xl px-5 py-6"}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg">
        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label="Découvrir l'offre Unibet"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        >
          <img
            src={IMAGE_URLS[imageIndex]}
            alt="Offre Unibet"
            className="block h-auto max-h-56 w-full object-cover sm:max-h-72"
            referrerPolicy="no-referrer"
          />
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fermer la publicité"
          className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div className="absolute bottom-2 left-2 flex gap-1.5" aria-label="Choisir la bannière">
          {IMAGE_URLS.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Afficher la bannière ${index + 1}`}
              aria-pressed={index === imageIndex}
              onClick={() => setImageIndex(index)}
              className={`h-2.5 w-2.5 rounded-full border border-white/80 ${index === imageIndex ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
