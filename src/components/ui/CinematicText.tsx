"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

interface CinematicTextProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  letterDelay?: number;
  scrollTriggered?: boolean;
}

export default function CinematicText({
  text,
  as = "h2",
  className = "",
  letterDelay = 0.028,
  scrollTriggered = true,
}: CinematicTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = motion[as];
  const letters = Array.from(text);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: letterDelay } },
  };

  const letter = {
    hidden: { opacity: 0, y: 24, filter: "blur(14px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <Tag
      ref={ref as any}
      className={className}
      variants={container}
      initial="hidden"
      {...(scrollTriggered
        ? { whileInView: "visible", viewport: { once: true, amount: 0.6 } }
        : { animate: "visible" })}
      aria-label={text}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          variants={letter}
          style={{ display: "inline-block", willChange: "transform, filter" }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Tag>
  );
}
