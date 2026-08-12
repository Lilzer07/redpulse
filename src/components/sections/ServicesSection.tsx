"use client";

import { motion } from "framer-motion";
import CinematicText from "@/components/ui/CinematicText";

const SERVICES = [
  { n: "01", title: "Financement sur-mesure", body: "Plans modulables, rachat de leasing, structuration patrimoniale." },
  { n: "02", title: "Reprise & estimation", body: "Expertise indépendante sous 48h, cote alignée sur le marché mondial." },
  { n: "03", title: "Livraison privée", body: "Remise des clés en showroom, à domicile, ou sur circuit." },
  { n: "04", title: "Entretien & garantie", body: "Ateliers certifiés constructeur, pièces d'origine, garantie étendue." },
];

export default function ServicesSection() {
  return (
    <section id="services" className="px-[6vw] py-[14vh] bg-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9 }}
      >
        <span className="eyebrow"><span className="ignition-rule" />12 — Retour au garage</span>
        <CinematicText
          as="h2"
          text="Au-delà de la vente."
          className="font-display text-[clamp(38px,6vw,84px)] mt-2.5"
        />
      </motion.div>

      <div className="mt-16 border-t border-white/10">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="group flex items-center justify-between py-8.5 border-b border-white/10"
          >
            <h3 className="font-display text-[clamp(24px,3.4vw,44px)] transition-colors group-hover:text-ignition">
              {s.title}
            </h3>
            <span className="text-xs text-text-dim tracking-[0.2em]">{s.n}</span>
            <p className="max-w-[340px] text-right text-text-dim text-[13px] leading-[1.6] hidden md:block">
              {s.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
