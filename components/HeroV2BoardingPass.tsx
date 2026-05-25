"use client";

/**
 * HERO V2 — "Boarding Pass"
 * Centered minimalist composition built around a chrome boarding-pass card.
 * Big-aviation feel: monospace serial, dotted perforation, plane silhouette,
 * and a quiet animated cloud field in the back.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const TICKER = [
  "RÉSINE MONOBLOC",
  "ÉCHELLE 1/200 → 1/85",
  "LED INTÉGRÉ",
  "TRAIN AMOVIBLE",
  "LIVRAISON FRANCE & EUROPE",
  "FAIT EN FRANCE",
];

export default function HeroV2BoardingPass() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#0a0a14]">
      {/* Animated cloud gradient */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 30% 30%, rgba(58,142,255,0.12), transparent 65%), radial-gradient(700px 400px at 75% 70%, rgba(208,212,218,0.07), transparent 60%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "10% 5%", "0% 0%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Star field */}
      <Stars />
      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 18%, transparent 70%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <div className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-5 md:px-8 pt-28 pb-24">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 hero-fade-up">
          <span className="h-px w-10 bg-[#3a8eff]/70" />
          <span className="hud text-[#3a8eff]">Embarquement immédiat</span>
          <span className="h-px w-10 bg-[#3a8eff]/70" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-center display leading-[0.92] text-[clamp(2rem,5.5vw,4.5rem)] hero-fade-up">
          <span className="block chrome-text">L'avion d'exception</span>
          <span className="block">
            <span className="text-white/85">miniaturisé</span>
            <span className="text-[#3a8eff]">.</span>
          </span>
        </h1>

        {/* Boarding pass card */}
        <div className="mt-10 w-full max-w-2xl hero-fade-up-delayed">
          <BoardingPass />
        </div>

        {/* CTA */}
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

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/50 backdrop-blur">
        <div className="overflow-hidden h-11 flex items-center">
          <motion.div
            className="flex gap-10 whitespace-nowrap pr-10"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          >
            {[...TICKER, ...TICKER, ...TICKER].map((m, i) => (
              <span
                key={i}
                className="hud text-white/55 inline-flex items-center gap-3"
              >
                <PlaneGlyph className="h-2.5 w-2.5 text-[#3a8eff]" />
                {m}
              </span>
            ))}
          </motion.div>
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

function BoardingPass() {
  const [serial, setSerial] = useState("AS-2026-001");
  useEffect(() => {
    // Looks like a live boarding code being assigned, but stays in family
    const id = setInterval(() => {
      const n = Math.floor(Math.random() * 999) + 1;
      setSerial(`AS-2026-${n.toString().padStart(3, "0")}`);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative rounded-2xl border border-white/15 bg-gradient-to-br from-[#13131c] via-[#0e0e16] to-[#13131c] overflow-hidden shadow-[0_30px_80px_-30px_rgba(58,142,255,0.35)]">
      {/* shimmer */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
        }}
        animate={{ x: ["-30%", "30%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grid grid-cols-[1fr_auto_1.4fr]">
        {/* Left stub */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2">
            <PlaneGlyph className="h-4 w-4 text-white/80" />
            <span className="hud text-white/60">AIRPLANESTORE</span>
          </div>
          <div className="mt-8">
            <div className="hud text-white/40">DE</div>
            <div className="mt-1 chrome-text display text-2xl md:text-3xl">PARIS</div>
            <div className="hud text-white/50 mt-1">FAIT EN FRANCE</div>
          </div>
          <div className="mt-6">
            <div className="hud text-white/40">À</div>
            <div className="mt-1 chrome-text display text-2xl md:text-3xl">VITRINE</div>
            <div className="hud text-white/50 mt-1">VOTRE BUREAU</div>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative w-px bg-white/10 my-6">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(255,255,255,0.35) 0 4px, transparent 4px 10px)",
            }}
          />
          <div className="absolute -top-3 -left-2.5 h-5 w-5 rounded-full bg-[#0a0a14] border border-white/10" />
          <div className="absolute -bottom-3 -left-2.5 h-5 w-5 rounded-full bg-[#0a0a14] border border-white/10" />
        </div>

        {/* Right stub */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <span className="hud text-white/40">EMBARQUEMENT</span>
            <span className="hud text-[#3a8eff] tabular-nums">{serial}</span>
          </div>

          {/* Plane silhouette */}
          <div className="mt-6 relative h-20 rounded-lg border border-white/10 bg-black/50 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 flex items-center"
              initial={{ x: "-25%" }}
              animate={{ x: "115%" }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <PlaneGlyph className="h-10 w-10 text-white" />
            </motion.div>
            {/* dotted trajectory */}
            <div
              aria-hidden
              className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0 6px, transparent 6px 12px)",
              }}
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Field label="Échelle" value="1/200" />
            <Field label="LED" value="Intégré" />
            <Field label="Matière" value="Résine" />
            <Field label="Train" value="Amovible" />
            <Field label="Livraison" value="FR · EU" />
            <Field label="Prix" value="dès 59€" highlight />
          </div>
        </div>
      </div>

      {/* Bottom barcode-style strip */}
      <div className="border-t border-white/10 bg-white/[0.02] px-6 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-[2px]">
          {Array.from({ length: 56 }).map((_, i) => (
            <span
              key={i}
              className="block bg-white/70"
              style={{
                width: ((i * 7) % 5) + 1,
                height: 18,
                opacity: ((i * 13) % 7) > 4 ? 0.85 : 0.45,
              }}
            />
          ))}
        </div>
        <span className="hud text-white/45">CODE PROMO · TAKEOFF10 · -10%</span>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="hud text-white/40">{label}</div>
      <div
        className={`mt-1 font-mono text-sm ${
          highlight ? "text-[#3a8eff]" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PlaneGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5L21 16Z" />
    </svg>
  );
}

function Stars() {
  // Pure-CSS small dot field, deterministic positions
  const dots = Array.from({ length: 60 }).map((_, i) => ({
    x: (i * 137.5) % 100,
    y: (i * 73.3) % 100,
    s: ((i * 7) % 4) * 0.5 + 0.5,
    o: ((i * 11) % 7) / 14 + 0.1,
    d: ((i * 5) % 5) + 2,
  }));
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
          }}
          animate={{ opacity: [d.o, d.o * 1.6, d.o] }}
          transition={{ duration: d.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
