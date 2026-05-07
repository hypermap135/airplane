"use client";

/**
 * HERO V3 — "Hangar Marquee"
 * Kinetic departures-board feel. Massive split title ("MAQUETTES — D'EXCEPTION"),
 * with two opposing horizontal marquees of model names sandwiching it,
 * a subtle vertical light beam, and a side index ticker.
 */

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const ROW_TOP = [
  "AIRBUS A380",
  "AIRBUS A350",
  "AIRBUS A320",
  "BOEING 747",
  "BOEING 777",
  "BOEING 787",
  "CONCORDE",
  "GULFSTREAM G650",
];
const ROW_BOTTOM = [
  "RÉSINE MONOBLOC",
  "LED INTÉGRÉ",
  "TRAIN AMOVIBLE",
  "ÉCHELLE 1/200 → 1/85",
  "LIVRAISON FRANCE & EUROPE",
  "ATELIER PARIS",
];

export default function HeroV3HangarMarquee() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#06060c]">
      {/* Concrete-floor gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 110%, rgba(58,142,255,0.18), transparent 70%), linear-gradient(180deg, #06060c 0%, #0a0a14 70%, #06060c 100%)",
        }}
      />

      {/* Vertical light beam */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(208,212,218,0.6) 30%, rgba(58,142,255,0.5) 80%, transparent)",
          filter: "blur(0.5px)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[300px] h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(208,212,218,0.10), transparent 70%)",
        }}
      />

      {/* Soft noise/scanlines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* Top status rail */}
      <div className="absolute top-20 left-0 right-0 z-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#3a8eff]">
              <span className="absolute inset-0 rounded-full bg-[#3a8eff] animate-ping opacity-70" />
            </span>
            <span className="hud text-white/55">HANGAR · OUVERT</span>
          </div>
          <span className="hud text-white/45">N°001 · ÉDITION 2026</span>
        </div>
      </div>

      {/* Side vertical index */}
      <div className="hidden lg:flex flex-col gap-3 absolute left-6 top-1/2 -translate-y-1/2 z-20 hero-fade-up">
        {["01", "02", "03", "04", "05"].map((n, i) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`hud tabular-nums ${
                i === 0 ? "text-[#3a8eff]" : "text-white/30"
              }`}
            >
              {n}
            </span>
            <span
              className={`h-px ${
                i === 0 ? "w-6 bg-[#3a8eff]" : "w-3 bg-white/20"
              } transition-all`}
            />
          </div>
        ))}
      </div>

      {/* TOP marquee */}
      <Marquee items={ROW_TOP} direction="left" className="absolute top-1/2 -translate-y-[calc(50%+10rem)] md:-translate-y-[calc(50%+12rem)]" />

      {/* TITLE */}
      <div className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-5 md:px-8">
        <h1 className="text-center display leading-[0.84] text-[clamp(2.6rem,9vw,8.5rem)] hero-fade-up">
          <span className="block chrome-text">Maquettes</span>
          <span className="block">
            <span className="hidden md:inline-block h-[3px] w-14 md:w-28 align-middle mr-4 md:mr-6 bg-white/40" />
            <span className="text-white">d'exception</span>
            <span className="text-[#3a8eff]">.</span>
          </span>
        </h1>

        <p className="mt-8 max-w-md text-center text-base md:text-lg text-white/65 hero-fade-up-delayed">
          L'atelier parisien où prennent vie les avions. Résine monobloc, LED intégré,
          livraison France &amp; Europe.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 hero-fade-up-delayed">
          <Link href="/collections/all" className="btn-chrome">
            <span>Entrer dans la collection</span>
            <motion.span
              aria-hidden
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </Link>
          <Link
            href="/collections/packs"
            className="group inline-flex items-center gap-3 h-12 px-5 text-sm tracking-wide text-white/70 hover:text-white transition"
          >
            <span>Voir les packs</span>
            <span className="h-px w-6 bg-white/40 group-hover:w-10 group-hover:bg-white transition-all" />
          </Link>
        </div>
      </div>

      {/* BOTTOM marquee */}
      <Marquee
        items={ROW_BOTTOM}
        direction="right"
        className="absolute top-1/2 translate-y-[calc(50%+9rem)] md:translate-y-[calc(50%+11rem)]"
      />

      {/* Bottom counter rail */}
      <div className="absolute bottom-6 left-0 right-0 z-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between">
          <span className="hud text-white/40">28 MODÈLES · 7 COLLECTIONS</span>
          <span className="hud text-white/40">CODE TAKEOFF10 · -10%</span>
        </div>
      </div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, delay, ease: EASE }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}

function Marquee({
  items,
  direction,
  className = "",
}: {
  items: string[];
  direction: "left" | "right";
  className?: string;
}) {
  const x = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];
  return (
    <div
      className={`left-0 right-0 z-[5] overflow-hidden pointer-events-none select-none ${className}`}
    >
      <motion.div
        className="flex gap-12 whitespace-nowrap pr-12"
        animate={{ x }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((m, i) => (
          <span
            key={i}
            className="display text-[clamp(2rem,6vw,4rem)] text-white/[0.08] inline-flex items-center gap-6"
            style={{
              WebkitTextStroke: "1px rgba(255,255,255,0.18)",
            }}
          >
            {m}
            <span className="text-[#3a8eff]/40 text-2xl">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
