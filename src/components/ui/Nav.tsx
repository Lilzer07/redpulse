"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface AmbientNode {
  osc: OscillatorNode;
  gain: GainNode;
}

export default function Nav() {
  const [soundOn, setSoundOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AmbientNode[]>([]);

  const toggleSound = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;

    if (!soundOn) {
      const t = ctx.currentTime;
      const specs: [OscillatorType, number, number][] = [
        ["sawtooth", 40, 0.05],
        ["sine", 80, 0.03],
      ];
      nodesRef.current = specs.map(([type, freq, target]) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        gain.gain.linearRampToValueAtTime(target, t + 1.2);
        return { osc, gain };
      });
    } else {
      const t = ctx.currentTime;
      nodesRef.current.forEach(({ osc, gain }) => {
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        osc.stop(t + 0.7);
      });
      nodesRef.current = [];
    }
    setSoundOn(!soundOn);
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.3, duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-[5vw] py-6 mix-blend-difference"
    >
      <div className="font-display text-xl tracking-[0.1em]">VELOCE</div>
      <div className="hidden md:flex gap-9 text-[12px] tracking-[0.15em] uppercase">
        <a href="#inventory" className="opacity-75 hover:opacity-100 transition-opacity">
          Collection
        </a>
        <a href="#configurator" className="opacity-75 hover:opacity-100 transition-opacity">
          Configurateur
        </a>
        <a href="#services" className="opacity-75 hover:opacity-100 transition-opacity">
          Services
        </a>
        <a href="#contact" className="opacity-75 hover:opacity-100 transition-opacity">
          Rendez-vous
        </a>
      </div>
      <button
        onClick={toggleSound}
        className="border border-white/30 px-3.5 py-2 text-[10px] tracking-[0.2em] uppercase"
      >
        Ambiance : {soundOn ? "on" : "off"}
      </button>
    </motion.nav>
  );
}
