"use client";

import { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export default function TiltCard({ children, className = "", intensity = 10 }: Props) {
  const shouldReduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 260, damping: 28 });
  const ySpring = useSpring(y, { stiffness: 260, damping: 28 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

  // Spotlight position inside card
  const spotX = useTransform(x, [-0.5, 0.5], ["20%", "80%"]);
  const spotY = useTransform(y, [-0.5, 0.5], ["20%", "80%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (shouldReduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "900px",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Cursor spotlight inside card */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-10 rounded-[1.25rem]"
        style={{
          background: `radial-gradient(280px circle at ${spotX} ${spotY}, rgba(58,142,255,0.14), transparent 65%)`,
        }}
      />
      <div style={{ transform: "translateZ(16px)" }}>{children}</div>
    </motion.div>
  );
}
