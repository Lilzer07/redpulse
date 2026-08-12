"use client";
/* eslint-disable react/no-unescaped-entities */

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import CinematicText from "@/components/ui/CinematicText";

interface CarCardData {
  badge: string;
  name: string;
  spec: string;
  price: string;
  swatches: string[];
}

const CARS: CarCardData[] = [
  { badge: "Grand Tourisme", name: "Ferrari", spec: "V8 Biturbo · 640 ch", price: "385 000 €", swatches: ["#a10f1f", "#0c0c0e", "#c4c8ce"] },
  { badge: "Hypercar", name: "Lamborghini Aventador", spec: "V12 Atmo · 780 ch", price: "465 000 €", swatches: ["#e8b100", "#0c0c0e", "#ff5a1f"] },
  { badge: "Ingénierie F1", name: "McLaren", spec: "V8 Biturbo · 720 ch", price: "310 000 €", swatches: ["#ff5a1f", "#0c0c0e", "#c4c8ce"] },
  { badge: "Sport Piste", name: "Porsche GT3 RS", spec: "Flat-6 Atmo · 525 ch", price: "245 000 €", swatches: ["#0c0c0e", "#c4c8ce", "#a10f1f"] },
];

function TiltCard({ car }: { car: CarCardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(circle at ${mx.get() * 100}% ${my.get() * 100}%, rgba(255,90,31,0.16), transparent 60%)`;

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mx.set(x);
    my.set(y);
    rotateY.set((x - 0.5) * 10);
    rotateX.set((0.5 - y) * 8);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="relative bg-panel/80 backdrop-blur-sm border border-white/[0.06] p-9 overflow-hidden"
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <div className="relative">
        <span className="text-[10px] tracking-[0.25em] uppercase text-ignition">{car.badge}</span>
        <h3 className="font-display text-[30px] mt-3.5">{car.name}</h3>
        <div className="flex gap-2 mt-5">
          {car.swatches.map((s) => (
            <span key={s} className="w-4 h-4 rounded-full inline-block" style={{ background: s }} />
          ))}
        </div>
        <div className="flex justify-between mt-6.5 pt-4.5 border-t border-white/[0.08] text-xs text-text-dim">
          <span>{car.spec}</span>
          <span className="text-titanium">{car.price}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function InventoryCards() {
  return (
    <section id="inventory" className="px-[6vw] py-[14vh] bg-graphite">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9 }}
      >
        <span className="eyebrow"><span className="ignition-rule" />13 — L'Inventaire</span>
        <CinematicText
          as="h2"
          text="Quatre légendes. Une collection."
          className="font-display text-[clamp(38px,6vw,84px)] mt-2.5"
        />
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
        {CARS.map((car, i) => (
          <motion.div
            key={car.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
          >
            <TiltCard car={car} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
