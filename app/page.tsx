import HeroIntro from "@/components/sections/HeroIntro";
import ShowroomCaptions from "@/components/sections/ShowroomCaptions";
import ServicesSection from "@/components/sections/ServicesSection";
import InventoryCards from "@/components/sections/InventoryCards";
import Configurator from "@/components/sections/Configurator";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      {/* Scene 1 */}
      <HeroIntro />

      {/* Scenes 2-11: pinned camera track (showroom + road), captions
          overlay the persistent WebGL canvas mounted in the root layout */}
      <ShowroomCaptions />

      {/* Scene 12 */}
      <ServicesSection />

      {/* Scene 13 */}
      <InventoryCards />

      {/* Scene 14 */}
      <Configurator />

      {/* Scene 15 */}
      <ContactSection />

      <footer className="px-[6vw] py-6 flex justify-between text-[11px] text-text-dim tracking-[0.1em] border-t border-white/[0.08] bg-black relative z-10">
        <span>VELOCE © 2026</span>
        <span>Maison Automobile — Accès sur invitation</span>
      </footer>
    </>
  );
}
