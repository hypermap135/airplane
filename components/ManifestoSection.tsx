"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const QUOTE = "Parce qu'une vraie maquette mérite la même attention qu'un vrai avion.";
const WORDS = QUOTE.split(" ");

const PILLARS = [
  { hud: "MAT", label: "Résine monobloc" },
  { hud: "FIN", label: "Peinture main" },
  { hud: "LED", label: "Éclairage intégré" },
  { hud: "SCL", label: "Échelle 1/147" },
  { hud: "SVC", label: "Retour 30 jours" },
];

export default function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // Scroll-drive the quote opacity per word
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  return (
    <section ref={ref} className="relative py-28 md:py-44 overflow-hidden">
      {/* Dense grid */}
      <div aria-hidden className="absolute inset-0 grid-hud-dense opacity-40" />

      {/* Radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 600px at 50% 55%, rgba(58,142,255,0.08), transparent 65%)",
        }}
      />

      {/* Animated glow blob */}
      {!shouldReduce && (
        <motion.div
          aria-hidden
          className="absolute pointer-events-none rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 500,
            height: 500,
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
            background:
              "radial-gradient(circle, rgba(58,142,255,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      )}

      <div className="relative mx-auto max-w-5xl px-5 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="hud text-led/70"
        >
          Notre philosophie
        </motion.div>

        {/* Quote — each word reveals as you scroll to it */}
        <div className="mt-10">
          <blockquote className="text-[clamp(2rem,5vw,4rem)] font-display font-black leading-[1.05] tracking-[0.02em]">
            {WORDS.map((word, i) => (
              <ScrollWord
                key={i}
                word={word}
                index={i}
                total={WORDS.length}
                scrollYProgress={scrollYProgress}
                shouldReduce={!!shouldReduce}
              />
            ))}
          </blockquote>
        </div>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 hud text-white/30"
        >
          — L'équipe AirplaneStore
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 mb-12 divider-led origin-center"
        />

        {/* Pillar pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
        >
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.hud}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-ink-border bg-ink-800/70 backdrop-blur-sm"
            >
              <span className="hud text-led/70 text-[0.65rem]">{p.hud}</span>
              <span className="text-white/70 text-[0.78rem] font-medium">{p.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ScrollWord({
  word,
  index,
  total,
  scrollYProgress,
  shouldReduce,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  shouldReduce: boolean;
}) {
  const start = index / total;
  const end = Math.min(start + 1.5 / total, 1);

  const opacity = useTransform(scrollYProgress, [start, end], [0.12, 1]);
  const y = useTransform(scrollYProgress, [start, end], [20, 0]);
  const filter = useTransform(
    scrollYProgress,
    [start, end],
    ["blur(6px)", "blur(0px)"]
  );

  if (shouldReduce) {
    return (
      <span className="inline-block chrome-text" style={{ marginRight: "0.25em" }}>
        {word}
      </span>
    );
  }

  return (
    <motion.span
      className="inline-block chrome-text"
      style={{ opacity, y, filter, marginRight: "0.25em" }}
    >
      {word}
    </motion.span>
  );
}
