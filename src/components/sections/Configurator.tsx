"use client";
/* eslint-disable react/no-unescaped-entities */
import { motion } from "framer-motion";
import { useConfigurator, type CarKey } from "@/store/useConfigurator";
import CinematicText from "@/components/ui/CinematicText";

const CAR_LABELS: Record<CarKey, string> = {
  ferrari: "Ferrari",
  lamborghini: "Lamborghini Aventador",
  mclaren: "McLaren",
  porsche: "Porsche GT3 RS",
};

const CALIPER_OPTIONS = [
  { label: "Ignition", hex: "#ff5a1f" },
  { label: "Argent", hex: "#e0e0e0" },
  { label: "Titane", hex: "#c4c8ce" },
];

const RIM_STYLES: { key: "forge" | "carbon" | "chrome"; label: string }[] = [
  { key: "forge", label: "Jantes Forgées" },
  { key: "carbon", label: "Jantes Carbone" },
  { key: "chrome", label: "Jantes Chrome" },
];

const INTERIOR_OPTIONS: { key: "cuir-noir" | "cuir-cognac" | "alcantara"; label: string }[] = [
  { key: "cuir-noir", label: "Cuir Noir" },
  { key: "cuir-cognac", label: "Cuir Cognac" },
  { key: "alcantara", label: "Alcantara" },
];

export default function Configurator() {
  const {
    activeCar,
    setActiveCar,
    paint,
    setPaint,
    paintOptions,
    caliperColor,
    setCaliperColor,
    rimStyle,
    setRimStyle,
    interior,
    setInterior,
    carbonPack,
    toggleCarbonPack,
  } = useConfigurator();

  return (
    <section id="configurator" className="px-[6vw] py-[14vh] bg-gradient-to-b from-black to-graphite">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="max-w-[720px]"
      >
        <span className="eyebrow"><span className="ignition-rule" />14 — Configurateur</span>
        <CinematicText
          as="h2"
          text="Faites-la vôtre."
          className="font-display text-[clamp(38px,6vw,84px)] mt-2.5"
        />
        <p className="text-text-dim mt-4 max-w-[480px] leading-[1.7]">
          Choisissez le modèle, la teinte, les étriers, les jantes, l'intérieur.
          Chaque changement est appliqué en temps réel sur le modèle 3D
          derrière vous.
        </p>

        <div className="mt-11">
          <div className="text-[11px] tracking-[0.25em] uppercase text-text-dim mb-3.5">Modèle</div>
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(CAR_LABELS) as CarKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveCar(key)}
                className={`px-4.5 py-2.5 text-[11px] tracking-[0.1em] uppercase border transition-colors ${
                  activeCar === key ? "border-ignition text-ignition" : "border-white/20 text-text-dim hover:border-ignition/60"
                }`}
              >
                {CAR_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9">
          <div className="text-[11px] tracking-[0.25em] uppercase text-text-dim mb-3.5">Teinte carrosserie</div>
          <div className="flex gap-3.5 flex-wrap">
            {paintOptions.map((opt) => (
              <button
                key={opt.hex}
                aria-label={opt.label}
                onClick={() => setPaint(opt.hex)}
                className="rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: opt.hex,
                  borderColor: paint === opt.hex ? "#ff5a1f" : "rgba(255,255,255,0.15)",
                  transform: paint === opt.hex ? "scale(1.15)" : undefined,
                  width: 38,
                  height: 38,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-9">
          <div className="text-[11px] tracking-[0.25em] uppercase text-text-dim mb-3.5">Étriers de frein</div>
          <div className="flex gap-3 flex-wrap">
            {CALIPER_OPTIONS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setCaliperColor(c.hex)}
                className={`px-4.5 py-2.5 text-[11px] tracking-[0.1em] uppercase border transition-colors ${
                  caliperColor === c.hex ? "border-ignition text-ignition" : "border-white/20 text-text-dim hover:border-ignition/60"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9">
          <div className="text-[11px] tracking-[0.25em] uppercase text-text-dim mb-3.5">Jantes</div>
          <div className="flex gap-3 flex-wrap">
            {RIM_STYLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRimStyle(r.key)}
                className={`px-4.5 py-2.5 text-[11px] tracking-[0.1em] uppercase border transition-colors ${
                  rimStyle === r.key ? "border-ignition text-ignition" : "border-white/20 text-text-dim hover:border-ignition/60"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9">
          <div className="text-[11px] tracking-[0.25em] uppercase text-text-dim mb-3.5">Intérieur</div>
          <div className="flex gap-3 flex-wrap">
            {INTERIOR_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setInterior(o.key)}
                className={`px-4.5 py-2.5 text-[11px] tracking-[0.1em] uppercase border transition-colors ${
                  interior === o.key ? "border-ignition text-ignition" : "border-white/20 text-text-dim hover:border-ignition/60"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9 flex items-center gap-4">
          <button
            role="switch"
            aria-checked={carbonPack}
            onClick={toggleCarbonPack}
            className={`w-12 h-6 rounded-full relative transition-colors ${carbonPack ? "bg-ignition" : "bg-white/15"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-black transition-transform ${carbonPack ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </button>
          <span className="text-sm text-text-dim">Pack carbone extérieur</span>
        </div>
      </motion.div>
    </section>
  );
}
