"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Stadium background */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/images/stadium-hero.png"
          alt="Stade de football illuminé la nuit"
          className="h-full w-full object-cover object-center"
        />
      </div>
      {/* Overlays for depth + legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/60 to-background" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/40 to-transparent" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-background to-transparent"
        aria-hidden
      />

      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-32 lg:grid-cols-2 lg:gap-8 lg:pt-28">
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
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              <Link href="/dashboard">
                Essayer gratuitement
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/15 bg-white/5 px-6 text-base font-medium text-foreground backdrop-blur hover:bg-white/10"
            >
              <a href="#demo">
                <Play className="mr-1 h-4 w-4" />
                Voir la démonstration
              </a>
            </Button>
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
