"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export default function ScrollProgress() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  if (shouldReduce) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #3a8eff 0%, #6aafff 60%, #ffffff 100%)",
        boxShadow: "0 0 12px rgba(58,142,255,0.9), 0 0 24px rgba(58,142,255,0.4)",
      }}
    />
  );
}
