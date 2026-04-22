"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const EXAMPLES = [
  { text: "Commandant Dupont", delay: 0 },
  { text: "Vol AF001 — 15/06/2024", delay: 0.07 },
  { text: "Joyeux anniversaire Papa", delay: 0.14 },
];

export default function PersonalizationSection() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.08, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={ref} className="relative py-24 md:py-36 overflow-hidden">
      {/* Background accent */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(700px 500px at 75% 50%, rgba(58,142,255,0.07), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 grid gap-14 lg:grid-cols-2 items-center">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hud text-led/80 mb-2">Gravure +15€</div>

          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="display text-[clamp(1.9rem,4.5vw,3rem)] leading-tight chrome-text"
            >
              Personnalisez votre maquette
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-5 text-mute text-base md:text-lg max-w-xl leading-relaxed"
          >
            Faites graver un nom, une date ou une immatriculation sur le socle en bois.
            Une pièce vraiment unique, pensée pour durer.
          </motion.p>

          {/* Example tags — staggered */}
          <div className="mt-8 space-y-3">
            {EXAMPLES.map((e, i) => (
              <motion.div
                key={e.text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.3 + e.delay, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 rounded-xl border border-ink-border bg-ink-600/60 px-5 py-3 group hover:border-led/30 transition-colors duration-300"
              >
                <span className="hud text-white/40 shrink-0">EX.</span>
                <span className="font-mono text-sm text-white/85 group-hover:text-white transition-colors">
                  &quot;{e.text}&quot;
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.55 }}
            className="mt-8"
          >
            <Link href="/products/gravure-personnalisee" className="btn-chrome">
              Ajouter une gravure →
            </Link>
          </motion.div>
        </motion.div>

        {/* Image side — scroll parallax scale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] hublot noise overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: "url(https://airplanestore.fr/cdn/shop/files/gravure.jpg)",
              opacity: 0.75,
              scale: shouldReduce ? 1 : imageScale,
              y: shouldReduce ? 0 : imageY,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />

          {/* HUD badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-5 left-5 right-5"
          >
            <div className="hud text-white/60">SOCLE BOIS MASSIF · GRAVURE LASER</div>
            <div className="mt-2 font-mono text-sm text-white/85 tracking-wide">
              &gt; À partir de 15€
            </div>
          </motion.div>

          {/* Pulsing corner accent */}
          {!shouldReduce && (
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-led"
              aria-hidden
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
