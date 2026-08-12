import { SiteNav } from "@/components/landing/site-nav"
import { Hero } from "@/components/landing/hero"
import { CompetitionMarquee } from "@/components/landing/competition-marquee"
import { Stats } from "@/components/landing/stats"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { LiveDemo } from "@/components/landing/live-demo"
import { Pricing } from "@/components/landing/pricing"
import { Faq } from "@/components/landing/faq"
import { SiteFooter } from "@/components/landing/site-footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <CompetitionMarquee />
        <Stats />
        <Features />
        <HowItWorks />
        <LiveDemo />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  )
}
