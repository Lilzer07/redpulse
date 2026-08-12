"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useScrollProgress, type SceneId } from "@/store/useScrollProgress";
import CinematicText from "@/components/ui/CinematicText";

const CAPTIONS: Partial<Record<SceneId, { num: string; title: string; body: string }>> = {
  "showroom-entry": {
    num: "02 — Entrée dans le showroom",
    title: "Trois silhouettes. Une même obsession.",
    body: "Sol miroir, éclairage LED calibré au lux près. La visite commence.",
  },
  "ferrari-orbit": {
    num: "03 — Ferrari",
    title: "Chaque courbe a un sens.",
    body: "Les étriers brillent, les phares s'allument, le moteur va parler.",
  },
  "ferrari-cockpit": {
    num: "04 — Cockpit",
    title: "L'habitacle prend vie.",
    body: "Volant, compteurs, fibre de carbone — le régime monte sous vos yeux.",
  },
  "showroom-tour": {
    num: "05 — La visite continue",
    title: "Trois autres légendes attendent.",
    body: "Lumières, reflets — chaque silhouette a sa propre lumière.",
  },
  "lamborghini-reveal": {
    num: "06 — Lamborghini Aventador",
    title: "Portes en élytre. Fumée orange.",
    body: "Un geste devenu signature — les portes se déploient vers le ciel.",
  },
  "lamborghini-underside": {
    num: "07 — Sous la robe",
    title: "Carbone, freins, échappement.",
    body: "Diffuseur et échappement à nu : la technique mise en scène.",
  },
  "mclaren-reveal": {
    num: "08 — McLaren",
    title: "L'ingénierie, dévoilée.",
    body: "Une silhouette pensée en soufflerie, jusqu'au moindre canal d'air.",
  },
  "mclaren-hood": {
    num: "08.1 — Capot moteur",
    title: "Le cœur, à ciel ouvert.",
    body: "Le capot se soulève sur un bloc pensé pour la piste autant que la route.",
  },
  "porsche-reveal": {
    num: "09 — Porsche GT3 RS",
    title: "La précision, incarnée.",
    body: "Une vue arrière qui referme la visite du showroom.",
  },
  "porsche-rear": {
    num: "09.1 — Aileron actif",
    title: "L'appui, sur commande.",
    body: "L'aileron se déploie, les feux s'allument un à un.",
  },
  "showroom-exit": {
    num: "10 — Sortie",
    title: "La route attend.",
    body: "La porte s'ouvre. La voiture démarre.",
  },
  "road-drive": {
    num: "11 — Sur route",
    title: "Motion blur. Caméra drone.",
    body: "La Ferrari roule. Le showroom devient souvenir.",
  },
};

export default function ShowroomCaptions() {
  const sceneId = useScrollProgress((s) => s.sceneId);
  const caption = CAPTIONS[sceneId];

  return (
    // 18 keyframes at a comfortable ~100vh each ≈ 1800vh.
    <div id="showroom-track" className="relative h-[1800vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute left-[6vw] bottom-[9vh] max-w-[440px] z-10">
          <AnimatePresence mode="wait">
            {caption && (
              <motion.div
                key={sceneId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="font-display text-[13px] tracking-[0.15em] text-ignition-dim">
                  {caption.num}
                </div>
                <CinematicText
                  key={`${sceneId}-title`}
                  text={caption.title}
                  as="h2"
                  scrollTriggered={false}
                  letterDelay={0.014}
                  className="font-display text-[clamp(32px,4vw,60px)] mt-1.5"
                />
                <p className="text-text-dim text-sm leading-[1.7] mt-2.5 max-w-[360px]">
                  {caption.body}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute right-[6vw] bottom-[9vh] z-10 flex gap-11">
          {[
            { v: "2.9", l: "0–100 km/h" },
            { v: "830", l: "Chevaux max." },
            { v: "355", l: "Km/h Vmax" },
          ].map((s) => (
            <div key={s.l} className="text-right">
              <div className="font-display text-[34px] text-titanium">{s.v}</div>
              <div className="text-[10px] tracking-[0.2em] text-text-dim uppercase mt-1">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
