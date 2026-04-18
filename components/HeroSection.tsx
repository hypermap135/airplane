"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const HERO_IMAGE =
  "https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg";

export default function HeroSection() {
  return (
    <section className="relative h-[100svh] min-h-[640px] flex items-center justify-center overflow-hidden noise">
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover opacity-[0.35]"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% 30%, rgba(58,142,255,0.12), transparent 70%), linear-gradient(180deg, rgba(10,10,20,0.4) 0%, rgba(10,10,20,0.95) 100%)",
        }}
      />

      {/* subtle floating particles */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute block w-[2px] h-[2px] rounded-full bg-white/50"
            style={{
              top: `${(i * 53) % 100}%`,
              left: `${(i * 37) % 100}%`,
              opacity: 0.25 + ((i * 7) % 40) / 100,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hud text-white/70"
        >
          Édition 2026 · Collection Résine Premium
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="display mt-5 text-[clamp(2.2rem,6.5vw,5rem)] leading-[0.95] chrome-text"
        >
          Maquettes d'avion
          <br />
          <span className="text-white">en résine premium</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-6 text-base md:text-lg text-mute max-w-2xl mx-auto"
        >
          Répliques fidèles. Échelle 1/147. LED intégré. Livraison France & Europe.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-10"
        >
          <Link href="/collections/all" className="btn-chrome">
            Découvrir la collection →
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-10 left-0 right-0 z-10"
      >
        <div className="mx-auto max-w-4xl px-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 hud text-white/60">
          <span>47 CM</span>
          <span className="text-white/20">·</span>
          <span>1/147</span>
          <span className="text-white/20">·</span>
          <span>LED</span>
          <span className="text-white/20">·</span>
          <span>Livraison 7–15 j</span>
        </div>
      </motion.div>
    </section>
  );
}
