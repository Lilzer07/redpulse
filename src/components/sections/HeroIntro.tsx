"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

/** Synthesized "engine start" — a short starter-motor whirr followed by the
 * engine catching and settling to an idle, entirely via WebAudio (no audio
 * file). Browsers block audio before a user gesture, so this is attempted
 * — silently swallowed if blocked — and the Nav sound toggle remains the
 * reliable, explicit way to hear the showroom ambiance either way. */
function playEngineStart() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;

    // starter motor: fast rhythmic clicks
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = 90;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      const start = t + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.03);
      gain.gain.linearRampToValueAtTime(0, start + 0.09);
      osc.start(start);
      osc.stop(start + 0.1);
    }

    // engine catches and settles to idle
    const engine = ctx.createOscillator();
    engine.type = "sawtooth";
    const engineGain = ctx.createGain();
    engine.connect(engineGain).connect(ctx.destination);
    const catchTime = t + 0.55;
    engine.frequency.setValueAtTime(160, catchTime);
    engine.frequency.exponentialRampToValueAtTime(60, catchTime + 0.9);
    engine.frequency.exponentialRampToValueAtTime(42, catchTime + 1.6);
    engineGain.gain.setValueAtTime(0, catchTime);
    engineGain.gain.linearRampToValueAtTime(0.08, catchTime + 0.15);
    engineGain.gain.linearRampToValueAtTime(0.03, catchTime + 1.6);
    engineGain.gain.linearRampToValueAtTime(0, catchTime + 2.4);
    engine.start(catchTime);
    engine.stop(catchTime + 2.5);
  } catch {
    /* autoplay blocked or WebAudio unavailable — fine, sound toggle covers it */
  }
}

export default function HeroIntro() {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const doorLeft = useAnimation();
  const doorRight = useAnimation();
  const soundFired = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.random() * 16);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoaded(true), 250);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!soundFired.current) {
      soundFired.current = true;
      playEngineStart();
    }
    const t = setTimeout(() => {
      doorLeft.start({ x: "-100%", transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1] } });
      doorRight.start({ x: "100%", transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1] } });
    }, 2400);
    return () => clearTimeout(t);
  }, [loaded, doorLeft, doorRight]);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">
      <motion.div
        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
        animate={{ opacity: loaded ? 0 : 1 }}
        transition={{ duration: 1.1 }}
        style={{ pointerEvents: loaded ? "none" : "auto" }}
      >
        <div className="font-display text-[15vw] opacity-90">VELOCE</div>
        <div className="w-[220px] h-px bg-white/10 mt-7 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 bg-ignition transition-[width] duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3.5 text-[11px] tracking-[0.3em] text-text-dim">
          CHARGEMENT — {Math.floor(progress)}%
        </div>
      </motion.div>

      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,90,31,0.16), rgba(255,90,31,0) 60%)",
          filter: "blur(10px)",
          top: "50%",
          left: "50%",
          translate: "-50% -50%",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 1.4, delay: 0.1 }}
      />
      {["hl-l", "hl-r"].map((id, i) => (
        <motion.div
          key={id}
          className="absolute top-1/2 w-[5vw] h-[1.6vw] bg-text rounded"
          style={{
            [i === 0 ? "left" : "right"]: "36%",
            filter: "blur(1.5px) drop-shadow(0 0 40px rgba(236,238,241,0.9))",
            translate: "0 -50%",
          } as React.CSSProperties}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.9, delay: 0.55 + i * 0.15 }}
        />
      ))}

      <motion.div
        className="relative z-[5] text-center h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 1.1, delay: 0.9 }}
      >
        <span className="eyebrow block">
          <span className="ignition-rule" />
          Maison Automobile — Sur Rendez-vous
        </span>
        <h1 className="font-display text-[clamp(50px,11vw,160px)] mt-3">VELOCE</h1>
        <span className="eyebrow block mt-3">Ferrari · Lamborghini · McLaren · Porsche</span>
      </motion.div>

      <motion.div
        id="door-left"
        className="absolute top-0 bottom-0 left-0 w-[52%] bg-black z-20 border-r border-white/[0.06]"
        animate={doorLeft}
      />
      <motion.div
        id="door-right"
        className="absolute top-0 bottom-0 right-0 w-[52%] bg-black z-20 border-l border-white/[0.06]"
        animate={doorRight}
      />

      <motion.div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-text-dim flex flex-col items-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        <span>Faites défiler</span>
        <div className="w-px h-8 bg-gradient-to-b from-ignition to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
