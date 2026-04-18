"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

const FEATURES = [
  {
    title: "Résine monobloc",
    body:
      "Coulée d'une seule pièce. Finition peinte à la main. Longueur 47 cm, poids 1,3 kg. Socle bois massif inclus.",
    hud: "MAT-01",
  },
  {
    title: "Éclairage LED",
    body:
      "Fuselage et cockpit illuminés pendant ~20 secondes. Interrupteur sous la maquette. Batterie lithium rechargeable par USB.",
    hud: "LED-20S",
  },
  {
    title: "Détails réalistes",
    body:
      "Train d'atterrissage amovible (se met ou s'enlève). Échelle 1/147. Livraison en boîte d'origine, emballage premium.",
    hud: "SCL-1/147",
  },
];

export default function UniqueFeatures() {
  return (
    <section className="relative py-24 md:py-32 bg-ink-700/40 border-y border-ink-border">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Fabrication"
          title="Ce qui rend nos maquettes uniques"
          subtitle="Trois détails qui changent tout — de la matière à la mise en lumière."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="card-chrome p-8 relative"
            >
              <div className="hud text-led/80">{f.hud}</div>
              <h3 className="display mt-4 text-lg text-white">{f.title}</h3>
              <p className="mt-4 text-mute leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
