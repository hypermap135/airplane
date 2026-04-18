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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${alignment}`}
    >
      {eyebrow && <div className="hud text-white/60">{eyebrow}</div>}
      <h2 className="display mt-2 text-[clamp(1.6rem,3.6vw,2.6rem)] leading-tight chrome-text">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-mute text-base md:text-lg">{subtitle}</p>}
      <div className="divider-glow mt-6" />
    </motion.div>
  );
}
