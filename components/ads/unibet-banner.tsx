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
          {position === 0 && (
            <div className="flex min-h-12 items-center justify-between bg-[#12271d] px-4 py-1.5 text-sm text-white/65 sm:px-6 sm:text-base">
              <span>Publicité. Cliquez pour en savoir plus.</span>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Fermer la publicité"
                className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center bg-transparent text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X className="h-7 w-7 stroke-[1.7]" aria-hidden />
              </button>
            </div>
          )}
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

        </div>
      ))}
    </aside>
  )
}
