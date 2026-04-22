"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function CustomCursor() {
  const shouldReduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  // Tight dot follow
  const dotX = useSpring(rawX, { stiffness: 900, damping: 55, mass: 0.25 });
  const dotY = useSpring(rawY, { stiffness: 900, damping: 55, mass: 0.25 });

  // Lagged glow follow
  const glowX = useSpring(rawX, { stiffness: 120, damping: 18, mass: 1 });
  const glowY = useSpring(rawY, { stiffness: 120, damping: 18, mass: 1 });

  useEffect(() => {
    if (shouldReduce) return;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setVisible(true);
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    const onEnterInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], input, textarea, select")) {
        setHovering(true);
      }
    };
    const onLeaveInteractive = () => setHovering(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onEnterInteractive);
    window.addEventListener("mouseout", onLeaveInteractive);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onEnterInteractive);
      window.removeEventListener("mouseout", onLeaveInteractive);
    };
  }, [rawX, rawY, shouldReduce]);

  if (shouldReduce) return null;

  return (
    <>
      {/* Outer glow orb — lagged, large */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9997] rounded-full"
        style={{
          width: hovering ? 64 : 48,
          height: hovering ? 64 : 48,
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
          background:
            "radial-gradient(circle, rgba(58,142,255,0.45) 0%, rgba(58,142,255,0.15) 45%, transparent 70%)",
          filter: "blur(6px)",
          transition: "width 0.3s, height 0.3s",
        }}
      />

      {/* Mid ring — medium lag */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-white/25"
        style={{
          width: hovering ? 36 : 24,
          height: hovering ? 36 : 24,
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? (hovering ? 0.8 : 0.4) : 0,
          transition: "width 0.3s, height 0.3s, opacity 0.3s",
          scale: clicking ? 0.8 : 1,
        }}
      />

      {/* Inner dot — tight follow */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width: clicking ? 4 : 6,
          height: clicking ? 4 : 6,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: hovering ? "#3a8eff" : "rgba(255,255,255,0.95)",
          boxShadow: `0 0 ${hovering ? "10px" : "6px"} rgba(58,142,255,0.9)`,
          opacity: visible ? 1 : 0,
          transition: "width 0.15s, height 0.15s, background-color 0.2s, box-shadow 0.2s",
        }}
      />
    </>
  );
}
