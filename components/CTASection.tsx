"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FAQ from "./FAQ";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      {/* Dramatic gradient mesh background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 600px at 30% 40%, rgba(58,142,255,0.09), transparent 60%), radial-gradient(600px 400px at 80% 70%, rgba(58,142,255,0.06), transparent 60%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-hud opacity-40" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Main CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-20 md:mb-28"
        >
          <div className="hud text-led/70 mb-4">Passez aux commandes</div>

          <h2 className="display text-[clamp(2.2rem,5.5vw,4.2rem)] leading-[0.92] chrome-text max-w-3xl">
            Votre prochaine pièce de collection.
          </h2>

          <p className="mt-6 text-mute text-base md:text-lg max-w-xl leading-relaxed">
            Livraison France & Europe. Emballage premium. Satisfait ou remboursé 30 jours.
          </p>

          <div className="mt-9 flex flex-wrap gap-4 items-center">
            <Link href="/collections/all" className="btn-chrome">
              Voir la collection →
            </Link>
            <Link href="/collections/packs" className="btn-ghost">
              Découvrir les packs
            </Link>
          </div>

          {/* Inline stats */}
          <div className="mt-10 flex flex-wrap gap-5">
            {[
              { label: "Livraison", value: "7–15 j" },
              { label: "Retour", value: "30 jours" },
              { label: "Note", value: "4.9 / 5" },
              { label: "Clients", value: "+2 000" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ink-border bg-ink-600/50"
              >
                <div className="hud text-white/35 text-[0.62rem]">{s.label}</div>
                <div className="font-mono font-bold text-white text-sm">{s.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="divider-led mb-16" />

        {/* FAQ */}
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="hud text-white/50 mb-4">Questions fréquentes</div>
            <h3 className="display text-[clamp(1.5rem,3vw,2.2rem)] chrome-text leading-tight">
              Tout ce qu'il faut savoir avant de commander.
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FAQ />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
