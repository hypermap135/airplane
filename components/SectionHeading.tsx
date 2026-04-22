"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`max-w-3xl ${alignment} overflow-hidden`}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="hud text-led/70"
        >
          {eyebrow}
        </motion.div>
      )}

      {/* Clip-path reveal on title */}
      <div className="overflow-hidden mt-2">
        <motion.h2
          initial={{ y: "110%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="display text-[clamp(1.7rem,3.8vw,2.8rem)] leading-tight chrome-text"
        >
          {title}
        </motion.h2>
      </div>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-4 text-mute text-base md:text-lg"
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        className={`divider-glow mt-6 ${align === "center" ? "origin-center" : "origin-left"}`}
      />
    </div>
  );
}
