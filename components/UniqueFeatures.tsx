"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "./SectionHeading";

const FEATURES = [
  {
    hud: "MAT-01",
    icon: "◈",
    title: "Résine monobloc",
    body: "Coulée d'une seule pièce, peinte à la main. Longueur 47 cm, poids 1,3 kg. Socle bois massif inclus.",
    stat: "47",
    statUnit: "cm",
    statLabel: "Longueur",
    accent: "rgba(58,142,255,0.08)",
    span: "col-span-1 md:col-span-1 lg:col-span-2",
    large: true,
  },
  {
    hud: "LED-20S",
    icon: "◉",
    title: "Éclairage LED",
    body: "Fuselage et cockpit illuminés ~20 secondes. Batterie lithium rechargeable USB.",
    stat: "20",
    statUnit: "s",
    statLabel: "Illumination",
    accent: "rgba(58,142,255,0.12)",
    span: "col-span-1",
    large: false,
  },
  {
    hud: "SCL-147",
    icon: "◇",
    title: "Détails réalistes",
    body: "Train d'atterrissage amovible. Échelle 1/147. Livraison emballage premium.",
    stat: "1/147",
    statUnit: "",
    statLabel: "Échelle",
    accent: "rgba(80,130,255,0.07)",
    span: "col-span-1",
    large: false,
  },
];

export default function UniqueFeatures() {
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative py-24 md:py-36 bg-ink-700/30 border-y border-ink-border overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 600px at 80% 50%, rgba(58,142,255,0.06), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-hud opacity-40" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Fabrication"
          title="Ce qui rend nos maquettes uniques"
          subtitle="Trois détails qui changent tout — de la matière à la mise en lumière."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.hud}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`card-bento p-7 flex flex-col ${f.span}`}
            >
              {/* Glow accent */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-[1.5rem] pointer-events-none"
                style={{
                  background: `radial-gradient(300px 200px at 20% 20%, ${f.accent}, transparent 70%)`,
                }}
              />

              {/* Top row */}
              <div className="relative flex items-start justify-between">
                <div className="hud text-led/70">{f.hud}</div>
                <span className="text-led/50 text-lg leading-none" aria-hidden>
                  {f.icon}
                </span>
              </div>

              {/* Animated stat */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className={`relative mt-5 font-display font-black chrome-text leading-none ${
                  f.large ? "text-[4.5rem] md:text-[5.5rem]" : "text-[3.5rem]"
                }`}
              >
                {f.stat}
                <span className="text-[0.45em] text-mute align-top mt-2 ml-0.5 font-mono font-normal">
                  {f.statUnit}
                </span>
              </motion.div>
              <div className="relative hud text-white/35 mt-1">{f.statLabel}</div>

              {/* Separator */}
              <div className="relative mt-5 mb-5 h-px bg-gradient-to-r from-led/20 via-led/10 to-transparent" />

              {/* Content */}
              <h3 className="relative display text-sm text-white">{f.title}</h3>
              <p className="relative mt-3 text-[0.82rem] text-mute leading-relaxed flex-1">
                {f.body}
              </p>

              {/* Bottom indicator */}
              {!shouldReduce && (
                <div className="relative mt-6 flex items-center gap-2">
                  <span className="animate-blink inline-block w-1.5 h-1.5 rounded-full bg-led/70" aria-hidden />
                  <span className="hud text-white/25 text-[0.6rem]">ACTIF</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
