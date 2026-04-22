"use client";

import { motion } from "framer-motion";

const QUOTE_WORDS =
  "Parce qu'une vraie maquette mérite la même attention qu'un vrai avion.".split(" ");

const wordVariant = {
  hidden: { opacity: 0.15, y: 12, filter: "blur(3px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const PILLARS = [
  { hud: "MAT", label: "Résine monobloc" },
  { hud: "FIN", label: "Peinture main" },
  { hud: "LED", label: "Éclairage intégré" },
  { hud: "SCL", label: "Échelle 1/147" },
  { hud: "SVC", label: "Retour 30 jours" },
];

export default function ManifestoSection() {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden">
      {/* Dense grid */}
      <div aria-hidden className="absolute inset-0 grid-hud-dense opacity-50" />

      {/* Glow center */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 500px at 50% 50%, rgba(58,142,255,0.07), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="hud text-led/70"
        >
          Notre philosophie
        </motion.div>

        {/* Big quote — word by word */}
        <motion.blockquote
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-8 text-[clamp(1.9rem,4.5vw,3.6rem)] font-display font-bold leading-[1.1] tracking-[0.03em] chrome-text"
        >
          {QUOTE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariant}
              className="inline-block"
              style={{ marginRight: "0.28em" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.blockquote>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 hud text-white/35"
        >
          — L'équipe AirplaneStore
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 mb-12 divider-led origin-center"
        />

        {/* Pillars row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
        >
          {PILLARS.map((p) => (
            <div
              key={p.hud}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-ink-border bg-ink-800/60"
            >
              <span className="hud text-led/70 text-[0.65rem]">{p.hud}</span>
              <span className="text-white/70 text-[0.78rem] font-medium">{p.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
