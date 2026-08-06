"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { TelegramPhone } from "@/components/landing/telegram-phone"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export function Hero() {
  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden">
      {/* Stadium background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/stadium-hero.png"
          alt="Stade de football illuminé la nuit"
          className="h-full w-full object-cover object-bottom"
        />
      </div>
      {/* Overlays for depth + legibility — kept light so the stadium stays visible */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/20 to-background/70" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-background/85 via-background/25 to-transparent" />
      <div
        className="absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-background to-transparent"
        aria-hidden
      />
      {/* Subtle green stadium glow */}
      <div
        className="absolute left-1/4 top-0 z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-32 lg:grid-cols-2 lg:gap-8 lg:pt-28">
        {/* Left copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Surveillance football en temps réel
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Ne manquez plus jamais un{" "}
            <span className="text-gradient-green">carton rouge</span>.
          </motion.h1>

          <motion.p variants={item} className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Recevez instantanément une notification Telegram dès qu’un carton rouge est distribué dans les
            compétitions que vous avez sélectionnées. Surveillez les plus grands championnats européens sans
            regarder plusieurs matchs à la fois.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/dashboard"
              size="lg"
              className="group h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              Commencer
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink
              href="#demo"
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/15 bg-white/5 px-6 text-base font-medium text-foreground backdrop-blur hover:bg-white/10"
            >
              <Play className="mr-1 h-4 w-4" />
              Voir la démonstration
            </ButtonLink>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Latence &lt; 2 s
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Sans engagement
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              20+ compétitions
            </div>
          </motion.div>
        </motion.div>

        {/* Right phone */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: -8 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <TelegramPhone />
        </motion.div>
      </div>
    </section>
  )
}
