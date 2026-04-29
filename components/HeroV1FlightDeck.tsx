"use client";

/**
 * HERO V1 — "Flight Deck"
 * Editorial split: massive chrome typography on the left,
 * cockpit instrument panel on the right (altimeter, attitude indicator, mach,
 * coordinates) with a live ticking feel. Bottom departures-board marquee.
 */

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const MODELS = [
  "A380 · AIR FRANCE",
  "A350 · AIR FRANCE",
  "CONCORDE · 1/125",
  "B777 · AIR FRANCE",
  "A320 · QATAR PSG",
  "B747 · LUFTHANSA",
  "GULFSTREAM · G650",
];

export default function HeroV1FlightDeck() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#08080f]">
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      {/* Glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 400px at 25% 60%, rgba(58,142,255,0.10), transparent 70%)",
        }}
      />
      {/* Scan line */}
      <motion.div
        aria-hidden
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(58,142,255,0.55), transparent)",
        }}
        initial={{ top: "8%" }}
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* Top status rail */}
      <div className="absolute top-20 left-0 right-0 z-20 hero-fade-up">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#3a8eff]">
              <span className="absolute inset-0 rounded-full bg-[#3a8eff] animate-ping opacity-70" />
            </span>
            <span className="hud text-white/55">SYS · ATELIER PARIS</span>
          </div>
          <LiveClock />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 pt-40 md:pt-44 pb-32 grid lg:grid-cols-12 gap-10 items-center">
        {/* LEFT — typography */}
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-3 hero-fade-up">
            <span className="h-px w-10 bg-[#3a8eff]/70" />
            <span className="hud text-[#3a8eff]">N°001 · Édition 2026</span>
          </div>

          <h1 className="mt-6 display leading-[0.86] text-[clamp(2.5rem,7.5vw,6.5rem)] hero-fade-up">
            <span className="block chrome-text">Maquettes</span>
            <span className="block">
              <span className="text-white">d'exception</span>
              <span className="text-[#3a8eff]">.</span>
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base md:text-lg text-white/70 leading-relaxed hero-fade-up-delayed">
            Atelier parisien. Résine monobloc, finition main, LED intégré.
            Livraison France &amp; Europe.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 hero-fade-up-delayed">
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
              className="group inline-flex items-center gap-3 h-12 px-5 text-sm tracking-wide text-white/75 hover:text-white transition"
            >
              <span>Voir les packs</span>
              <span className="h-px w-6 bg-white/40 group-hover:w-10 group-hover:bg-white transition-all" />
            </Link>
          </div>
        </div>

        {/* RIGHT — instrument panel */}
        <div className="lg:col-span-4 hero-fade-up-delayed">
          <InstrumentPanel />
        </div>
      </div>

      {/* Departures-board marquee */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0a0a14]/80 backdrop-blur">
        <div className="overflow-hidden h-12 flex items-center">
          <motion.div
            className="flex gap-12 whitespace-nowrap pr-12"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          >
            {[...MODELS, ...MODELS, ...MODELS].map((m, i) => (
              <span key={i} className="hud text-white/50 inline-flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-[#3a8eff]/70" />
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

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const hh = d.getUTCHours().toString().padStart(2, "0");
      const mm = d.getUTCMinutes().toString().padStart(2, "0");
      const ss = d.getUTCSeconds().toString().padStart(2, "0");
      setTime(`${hh}:${mm}:${ss} UTC`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="hud text-white/45 tabular-nums">{time || "00:00:00 UTC"}</span>;
}

function InstrumentPanel() {
  return (
    <div className="relative grid grid-cols-2 gap-3 p-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-sm">
      <AttitudeIndicator />
      <Altimeter />
      <SpeedReadout />
      <CoordReadout />
      <div className="col-span-2 flex items-center justify-between px-2 pt-2 border-t border-white/5">
        <span className="hud text-white/40">FLIGHT</span>
        <span className="hud text-[#3a8eff] tabular-nums">AS-001 / FR &amp; EU</span>
      </div>
    </div>
  );
}

function AttitudeIndicator() {
  // Subtle continuous bank like a real artificial horizon
  const [bank, setBank] = useState(0);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.012;
      setBank(Math.sin(t) * 6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="col-span-2 relative aspect-[16/7] rounded-xl overflow-hidden border border-white/10 bg-black">
      <motion.div
        aria-hidden
        className="absolute inset-[-30%]"
        style={{
          rotate: bank,
          background:
            "linear-gradient(180deg, #0d2540 0%, #0d2540 50%, #2a1a10 50%, #2a1a10 100%)",
        }}
      />
      {/* Horizon line */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-1/2 h-px bg-white/40"
        style={{ transform: `rotate(${bank}deg)`, transformOrigin: "50% 0" }}
      />
      {/* Center crosshair (fixed) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="h-px w-16 bg-[#3a8eff]" />
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-3 w-3 border border-[#3a8eff]" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-3 w-3 border border-[#3a8eff]" />
        </div>
      </div>
      <div className="absolute bottom-2 left-3 hud text-white/60">ATTITUDE</div>
      <div className="absolute bottom-2 right-3 hud text-white/60 tabular-nums">{bank.toFixed(1)}°</div>
    </div>
  );
}

function Altimeter() {
  const [alt, setAlt] = useState(36000);
  useEffect(() => {
    const id = setInterval(() => {
      setAlt((a) => a + Math.round((Math.random() - 0.5) * 30));
    }, 800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="hud text-white/40">ALT · FT</div>
      <div className="mt-1 font-mono tabular-nums text-2xl text-white tracking-tight">
        {alt.toLocaleString("fr-FR")}
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#3a8eff] to-white"
          animate={{ width: ["55%", "72%", "60%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function SpeedReadout() {
  const mv = useMotionValue(0.84);
  const sp = useSpring(mv, { stiffness: 60, damping: 20 });
  const text = useTransform(sp, (v) => `M ${v.toFixed(2)}`);
  useEffect(() => {
    const id = setInterval(() => {
      mv.set(0.78 + Math.random() * 0.08);
    }, 1200);
    return () => clearInterval(id);
  }, [mv]);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="hud text-white/40">MACH</div>
      <motion.div className="mt-1 font-mono tabular-nums text-2xl text-white tracking-tight">
        {text}
      </motion.div>
      <div className="mt-2 hud text-white/40">CRUISE</div>
    </div>
  );
}

function CoordReadout() {
  return (
    <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
      <div>
        <div className="hud text-white/40">ATELIER</div>
        <div className="mt-1 font-mono text-sm text-white">48.8566° N · 2.3522° E</div>
      </div>
      <div className="text-right">
        <div className="hud text-white/40">MATÉRIAU</div>
        <div className="mt-1 font-mono text-sm text-white">RÉSINE MONOBLOC</div>
      </div>
    </div>
  );
}
