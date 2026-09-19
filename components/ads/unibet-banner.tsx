"use client"

import { useState } from "react"
import { X } from "lucide-react"

const AFFILIATE_URL =
  "https://wlfdj.adsrv.eacdn.com/C.ashx?btag=a_1523b_108c_&affid=724&siteid=1523&adid=108&c="

const IMAGE_URLS = [
  "https://drive.google.com/thumbnail?id=1g55s3HmWAV7GWN68fNhjKtmIJndC5j6c&sz=w1600",
  "https://drive.google.com/thumbnail?id=1KK3tzYV673gru52F5w3_DEaEw4q3ckup&sz=w1600",
  "https://drive.google.com/thumbnail?id=1daqBypMbNTDnxJciGvAcPYCTX8XGSsco&sz=w1600",
]

export function UnibetBanner({
  placement = "landing",
  bannerIndex,
}: {
  placement?: "landing" | "dashboard"
  bannerIndex?: 0 | 1 | 2
}) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const bannerClass = placement === "dashboard"
    ? "mx-auto w-full px-3 py-2 sm:max-w-[680px] sm:px-6"
    : "mx-auto w-full px-4 py-3 sm:max-w-[680px] sm:px-6"
  const indexes = bannerIndex === undefined ? [0, 1] : [bannerIndex]

  return (
    <aside aria-label="Publicité Unibet" className={bannerClass}>
      {indexes.map((index, position) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm ${position > 0 ? "mt-2" : ""}`}
        >
          <a
            href={AFFILIATE_URL}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label="Découvrir l'offre Unibet"
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          >
            <img
              src={IMAGE_URLS[index]}
              alt="Offre Unibet"
              className="mx-auto block h-auto w-full sm:max-w-[680px]"
              referrerPolicy="no-referrer"
            />
          </a>
          {position === 0 && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fermer la publicité"
              className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-8 sm:w-8"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            </button>
          )}
        </div>
      ))}
    </aside>
  )
}
