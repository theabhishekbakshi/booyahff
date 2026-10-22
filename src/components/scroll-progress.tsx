"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotion } from "framer-motion";

/** Thin scroll progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  // spring smooths the bar: direct mapping looks janky while scrolling fast
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-100 h-0.5 origin-left bg-gradient-to-r from-brand via-[#ffb257] to-signal"
      style={reduce ? { scaleX: scrollYProgress } : { scaleX }}
    />
  );
}
