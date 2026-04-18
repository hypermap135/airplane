"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EXAMPLES = [
  "Commandant Dupont",
  "Vol AF001 — 15/06/2024",
  "Joyeux anniversaire Papa",
];

export default function PersonalizationSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid gap-12 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="hud text-white/60">Gravure +15€</div>
          <h2 className="display mt-2 text-[clamp(1.8rem,4vw,2.8rem)] leading-tight chrome-text">
            Personnalisez votre maquette
          </h2>
          <p className="mt-5 text-mute text-base md:text-lg max-w-xl">
            Faites graver un nom, une date ou une immatriculation sur le socle en bois. Une pièce
            vraiment unique, pensée pour durer.
          </p>

          <div className="mt-8 space-y-3">
            {EXAMPLES.map((e) => (
              <div
                key={e}
                className="flex items-center gap-4 rounded-xl border border-ink-border bg-ink-600/60 px-5 py-3"
              >
                <span className="hud text-white/50 shrink-0">EX.</span>
                <span className="font-mono text-sm text-white/85">“{e}”</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/products/gravure-personnalisee" className="btn-chrome">
              Ajouter une gravure
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/5] hublot noise"
        >
          <div
            className="absolute inset-0 bg-center bg-cover opacity-70"
            style={{
              backgroundImage:
                "url(https://airplanestore.fr/cdn/shop/files/gravure.jpg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="hud text-white/70">SOCLE BOIS MASSIF · GRAVURE LASER</div>
            <div className="mt-2 text-white/90 font-mono text-sm tracking-wide">
              &gt; À partir de 15€
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
