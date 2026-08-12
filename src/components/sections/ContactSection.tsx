"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CinematicText from "@/components/ui/CinematicText";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative px-[6vw] py-[14vh] bg-black overflow-hidden">
      <div
        className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,90,31,0.14), transparent 70%)",
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
        >
          <span className="eyebrow"><span className="ignition-rule" />15 — Prendre Rendez-vous</span>
          <CinematicText
            as="h2"
            text="Venez l'entendre démarrer."
            className="font-display text-[clamp(40px,7vw,100px)] mt-3"
          />
          <p className="text-text-dim mt-5 max-w-[420px] leading-[1.7]">
            Essai privé sur rendez-vous, en showroom ou sur circuit partenaire.
          </p>

          {submitted ? (
            <p className="mt-10 text-ignition text-sm tracking-[0.05em]">
              Merci — un conseiller vous contactera sous 24h.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 max-w-[420px]">
              <input
                required
                placeholder="Nom complet"
                className="bg-transparent border-b border-white/20 py-3 text-sm placeholder:text-text-dim focus:border-ignition outline-none transition-colors"
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="bg-transparent border-b border-white/20 py-3 text-sm placeholder:text-text-dim focus:border-ignition outline-none transition-colors"
              />
              <input
                placeholder="Modèle souhaité"
                className="bg-transparent border-b border-white/20 py-3 text-sm placeholder:text-text-dim focus:border-ignition outline-none transition-colors"
              />
              <button
                type="submit"
                className="mt-6 self-start px-9 py-4 border border-ignition text-ignition text-[11px] tracking-[0.25em] uppercase relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-ignition translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
                <span className="group-hover:text-black transition-colors duration-300">
                  Réserver un créneau
                </span>
              </button>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="h-[420px] lg:h-auto border border-white/10 overflow-hidden"
        >
          <iframe
            title="Showroom VELOCE"
            className="w-full h-full grayscale contrast-125 opacity-80"
            src="https://www.google.com/maps?q=Paris%2C%20France&output=embed"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
