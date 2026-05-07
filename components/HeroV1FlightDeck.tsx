"use client";

/**
 * HERO V1 — "Flight Deck"
 * Editorial split: massive chrome typography on the left,
 * full Airbus-style glass cockpit interior on the right
 * (Glareshield FCU + PFD + ND + ECAM + throttle pedestal).
 * Bottom departures-board marquee.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
              <span className="text-white">d&apos;exception</span>
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

        {/* RIGHT — full cockpit interior */}
        <div className="lg:col-span-4 hero-fade-up-delayed">
          <CockpitInterior />
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

/* ════════════════════════════════════════════════════════════════════════
 * AIRBUS-STYLE GLASS COCKPIT INTERIOR
 *  ┌─────────────────────────────────┐
 *  │  GLARESHIELD (FCU mode panel)   │
 *  ├──────────────┬──────────────────┤
 *  │   PFD        │   ND (compass)   │
 *  ├──────────────┴──────────────────┤
 *  │   ECAM (engine bars: N1/EGT/FF) │
 *  ├─────────────────────────────────┤
 *  │   PEDESTAL (throttle quadrant)  │
 *  └─────────────────────────────────┘
 * ════════════════════════════════════════════════════════════════════════ */

function CockpitInterior() {
  return (
    <div className="relative">
      {/* Cockpit chassis — dark interior with subtle blue cabin lighting */}
      <div
        className="relative rounded-[1.5rem] p-2.5 sm:p-3 space-y-2"
        style={{
          background:
            "linear-gradient(160deg, #131826 0%, #08090f 50%, #050608 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "inset 0 2px 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(58,142,255,0.04), 0 30px 80px -20px rgba(0,0,0,0.7)",
        }}
      >
        {/* Bezel screws (corners) */}
        {[
          { top: 8, left: 8 },
          { top: 8, right: 8 },
          { bottom: 8, left: 8 },
          { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              ...pos,
              background:
                "radial-gradient(circle at 30% 30%, #2a2d38, #0a0a10)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          />
        ))}

        {/* 1. GLARESHIELD with FCU panel */}
        <Glareshield />

        {/* 2. Main displays — PFD + ND side by side */}
        <div className="grid grid-cols-2 gap-2">
          <PFDDisplay />
          <NDDisplay />
        </div>

        {/* 3. ECAM (engine indications) */}
        <ECAMDisplay />

        {/* 4. PEDESTAL (throttle + side stick) */}
        <Pedestal />

        {/* Subtle cabin window frame highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.5rem]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 25%, transparent 75%, rgba(58,142,255,0.04) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── 1. GLARESHIELD (Flight Control Unit panel at top) ─────────────────── */

function Glareshield() {
  const [spd, setSpd] = useState(238);
  const [hdg, setHdg] = useState(132);
  const [alt, setAlt] = useState(36000);
  useEffect(() => {
    const id = setInterval(() => {
      setSpd((v) => Math.max(220, Math.min(260, v + (Math.random() < 0.5 ? -1 : 1))));
      setHdg((v) => (v + (Math.random() < 0.5 ? -1 : 1) + 360) % 360);
      setAlt((v) => v + Math.round((Math.random() - 0.5) * 50));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative rounded-md px-2 py-1.5"
      style={{
        background:
          "linear-gradient(180deg, #1a1f2c 0%, #10131a 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <FCUSlot label="SPD" value={spd.toString()} />
        <FCUSlot label="HDG" value={hdg.toString().padStart(3, "0")} />
        <FCUSlot label="ALT" value={alt.toString()} unit="FT" />
        <FCUSlot label="V/S" value="+0" unit="FPM" muted />
      </div>
      {/* Mode annunciator strip */}
      <div className="mt-1 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Annunciator color="#7ee08c" label="A/THR" />
          <Annunciator color="#7ee08c" label="LNAV" />
          <Annunciator color="#3a8eff" label="VNAV" />
        </div>
        <span className="hud text-white/40 text-[7px]">FCU</span>
      </div>
    </div>
  );
}

function FCUSlot({
  label,
  value,
  unit,
  muted,
}: {
  label: string;
  value: string;
  unit?: string;
  muted?: boolean;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center px-1.5 py-1 rounded"
      style={{
        background: "#000",
        border: "1px solid rgba(0,191,255,0.2)",
        boxShadow: "inset 0 0 4px rgba(0,191,255,0.1)",
      }}
    >
      <span className="hud text-white/40 text-[7px]">{label}</span>
      <span
        className="font-mono font-bold tabular-nums leading-none mt-0.5"
        style={{
          fontSize: "0.72rem",
          color: muted ? "rgba(255,255,255,0.35)" : "#00d4ff",
          textShadow: muted ? "none" : "0 0 4px rgba(0,212,255,0.7)",
        }}
      >
        {value}
      </span>
      {unit && <span className="hud text-white/30 text-[6px]">{unit}</span>}
    </div>
  );
}

function Annunciator({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="px-1 py-0.5 rounded font-mono font-bold uppercase"
      style={{
        fontSize: "6px",
        letterSpacing: "0.1em",
        color: color,
        background: "rgba(0,0,0,0.6)",
        border: `1px solid ${color}40`,
        textShadow: `0 0 3px ${color}80`,
      }}
    >
      {label}
    </span>
  );
}

/* ─── 2a. PFD (Primary Flight Display) ──────────────────────────────────── */

function PFDDisplay() {
  return (
    <div
      className="relative aspect-square rounded overflow-hidden"
      style={{
        background: "#000",
        border: "1px solid rgba(0,191,255,0.25)",
        boxShadow:
          "inset 0 0 30px rgba(0,0,0,0.7), 0 0 8px rgba(0,191,255,0.05)",
      }}
    >
      {/* Speed tape (left) */}
      <SpeedTape />
      {/* Center: attitude indicator */}
      <div className="absolute inset-0 left-[20%] right-[20%]">
        <AttitudeCore />
      </div>
      {/* Altitude tape (right) */}
      <AltitudeTape />
      {/* Bottom label */}
      <div className="absolute bottom-1 left-0 right-0 text-center hud text-white/40 text-[7px]">
        PFD
      </div>

      {/* Glass reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%)",
        }}
      />
    </div>
  );
}

function AttitudeCore() {
  const [bank, setBank] = useState(0);
  const [pitch, setPitch] = useState(0);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.01;
      setBank(Math.sin(t) * 4);
      setPitch(Math.cos(t * 1.3) * 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Sky/ground */}
      <motion.div
        aria-hidden
        className="absolute"
        style={{
          inset: "-50%",
          rotate: bank,
          y: pitch * 4,
          background:
            "linear-gradient(180deg, #1a4a8a 0%, #2a72c0 49%, #6a4a2c 51%, #3a2a14 100%)",
        }}
      />
      {/* Bank arc with markers */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <g stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" fill="none">
          {[-30, -20, -10, 10, 20, 30].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const r = 38;
            const x1 = 50 + Math.sin(rad) * r;
            const y1 = 50 - Math.cos(rad) * r;
            const len = angle % 30 === 0 ? 4 : 2;
            const x2 = 50 + Math.sin(rad) * (r + len);
            const y2 = 50 - Math.cos(rad) * (r + len);
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        {/* Bank pointer */}
        <g style={{ transform: `rotate(${-bank}deg)`, transformOrigin: "50px 50px" }}>
          <polygon points="50,8 48,13 52,13" fill="#fff" />
        </g>
      </svg>
      {/* Fixed yellow aircraft */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <g fill="#ffd84d" stroke="rgba(0,0,0,0.4)" strokeWidth="0.3">
          <rect x="35" y="49" width="14" height="2" />
          <rect x="51" y="49" width="14" height="2" />
          <rect x="49" y="49" width="2" height="4" />
          <circle cx="50" cy="50" r="1.2" />
        </g>
      </svg>
    </div>
  );
}

function SpeedTape() {
  const [spd, setSpd] = useState(238);
  useEffect(() => {
    const id = setInterval(() => {
      setSpd((v) => Math.max(220, Math.min(260, v + (Math.random() < 0.5 ? -1 : 1))));
    }, 800);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="absolute left-0 top-2 bottom-2 w-[20%] flex flex-col items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.65)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Speed values rolling */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center">
          {[spd + 20, spd + 10, spd, spd - 10, spd - 20].map((v, i) => (
            <span
              key={i}
              className="font-mono tabular-nums text-white/40 text-[8px] my-1"
              style={{ opacity: i === 2 ? 0 : 0.5 - Math.abs(i - 2) * 0.15 }}
            >
              {v}
            </span>
          ))}
        </div>
        {/* Current value box */}
        <div
          className="relative px-1 py-0.5 z-10"
          style={{
            background: "#000",
            border: "1px solid #ffd84d",
            boxShadow: "0 0 4px rgba(255,216,77,0.5)",
          }}
        >
          <span
            className="font-mono font-bold tabular-nums text-white text-[0.62rem]"
            style={{ textShadow: "0 0 3px rgba(255,255,255,0.6)" }}
          >
            {spd}
          </span>
        </div>
      </div>
      <span className="absolute top-1 left-1 hud text-white/40 text-[6px]">KT</span>
    </div>
  );
}

function AltitudeTape() {
  const [alt, setAlt] = useState(36000);
  useEffect(() => {
    const id = setInterval(() => {
      setAlt((v) => v + Math.round((Math.random() - 0.5) * 30));
    }, 800);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="absolute right-0 top-2 bottom-2 w-[20%] flex flex-col items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.65)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center">
          {[alt + 200, alt + 100, alt, alt - 100, alt - 200].map((v, i) => (
            <span
              key={i}
              className="font-mono tabular-nums text-white/40 text-[7px] my-1"
              style={{ opacity: i === 2 ? 0 : 0.5 - Math.abs(i - 2) * 0.15 }}
            >
              {v.toLocaleString("fr-FR")}
            </span>
          ))}
        </div>
        <div
          className="relative px-1 py-0.5 z-10"
          style={{
            background: "#000",
            border: "1px solid #ffd84d",
            boxShadow: "0 0 4px rgba(255,216,77,0.5)",
          }}
        >
          <span
            className="font-mono font-bold tabular-nums text-white text-[0.55rem]"
            style={{ textShadow: "0 0 3px rgba(255,255,255,0.6)" }}
          >
            {alt.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>
      <span className="absolute top-1 right-1 hud text-white/40 text-[6px]">FT</span>
    </div>
  );
}

/* ─── 2b. ND (Navigation Display — compass + route) ─────────────────────── */

function NDDisplay() {
  const [hdg, setHdg] = useState(132);
  useEffect(() => {
    const id = setInterval(() => {
      setHdg((v) => (v + (Math.random() < 0.5 ? -1 : 1) + 360) % 360);
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="relative aspect-square rounded overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 70%, #001428 0%, #000 80%)",
        border: "1px solid rgba(0,191,255,0.25)",
        boxShadow:
          "inset 0 0 30px rgba(0,0,0,0.7), 0 0 8px rgba(0,191,255,0.05)",
      }}
    >
      {/* Compass arc */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        {/* Outer compass arc */}
        <g stroke="rgba(0,191,255,0.6)" fill="none" strokeWidth="0.4">
          <circle cx="50" cy="65" r="38" />
        </g>
        {/* Heading ticks */}
        <g style={{ transform: `rotate(${-hdg}deg)`, transformOrigin: "50px 65px", transition: "transform 0.8s ease-out" }}>
          {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
            const isMajor = deg % 30 === 0;
            const rad = (deg * Math.PI) / 180;
            const r1 = 38;
            const r2 = isMajor ? 34 : 36;
            const x1 = 50 + Math.sin(rad) * r1;
            const y1 = 65 - Math.cos(rad) * r1;
            const x2 = 50 + Math.sin(rad) * r2;
            const y2 = 65 - Math.cos(rad) * r2;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "rgba(255,255,255,0.7)" : "rgba(0,191,255,0.4)"}
                strokeWidth={isMajor ? 0.6 : 0.3}
              />
            );
          })}
          {/* N letter (red) */}
          <text
            x="50"
            y="22"
            fill="#ff4d4d"
            fontSize="5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
            style={{ transform: `rotate(${hdg}deg)`, transformOrigin: "50px 22px" }}
          >
            N
          </text>
        </g>
        {/* Heading bug at top of arc */}
        <polygon
          points="50,24 47,28 53,28"
          fill="#ff00ff"
          opacity="0.9"
        />
        {/* Route line (LNAV path) */}
        <g stroke="#00ff7e" fill="none" strokeWidth="0.6" strokeDasharray="2 1">
          <path d="M50 65 L52 50 L48 35 L55 25" />
        </g>
        {/* Waypoints */}
        <g fill="#00ff7e">
          <circle cx="52" cy="50" r="0.8" />
          <circle cx="48" cy="35" r="0.8" />
          <circle cx="55" cy="25" r="1.2" stroke="#00ff7e" strokeWidth="0.4" fill="none" />
        </g>
        {/* Aircraft (fixed at compass center) */}
        <g fill="#ffd84d" stroke="rgba(0,0,0,0.4)" strokeWidth="0.2">
          <polygon points="50,60 47,68 50,66 53,68" />
        </g>
      </svg>

      {/* HDG digital readout (top center) */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2">
        <div
          className="px-1 py-0.5 font-mono font-bold tabular-nums"
          style={{
            background: "#000",
            border: "1px solid #ff00ff",
            color: "#fff",
            fontSize: "0.55rem",
            textShadow: "0 0 3px rgba(255,255,255,0.7)",
          }}
        >
          {hdg.toString().padStart(3, "0")}°
        </div>
      </div>

      {/* Range / mode labels */}
      <div className="absolute top-1 left-1 hud text-cyan-300/70 text-[6px]">ND · 80NM</div>
      <div className="absolute bottom-1 right-1 hud text-cyan-300/60 text-[6px]">ARC</div>

      {/* Glass reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%)",
        }}
      />
    </div>
  );
}

/* ─── 3. ECAM (Engine indications) ──────────────────────────────────────── */

function ECAMDisplay() {
  const [vals, setVals] = useState({ n1L: 89, n1R: 88, egtL: 720, egtR: 715, ffL: 2.1, ffR: 2.0 });
  useEffect(() => {
    const id = setInterval(() => {
      setVals((v) => ({
        n1L: Math.max(85, Math.min(94, v.n1L + (Math.random() < 0.5 ? -1 : 1))),
        n1R: Math.max(85, Math.min(94, v.n1R + (Math.random() < 0.5 ? -1 : 1))),
        egtL: Math.max(700, Math.min(750, v.egtL + Math.round((Math.random() - 0.5) * 6))),
        egtR: Math.max(700, Math.min(750, v.egtR + Math.round((Math.random() - 0.5) * 6))),
        ffL: parseFloat(Math.max(1.8, Math.min(2.3, v.ffL + (Math.random() - 0.5) * 0.05)).toFixed(1)),
        ffR: parseFloat(Math.max(1.8, Math.min(2.3, v.ffR + (Math.random() - 0.5) * 0.05)).toFixed(1)),
      }));
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="relative rounded p-2"
      style={{
        background: "#000",
        border: "1px solid rgba(0,191,255,0.25)",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="hud text-cyan-300/70 text-[7px]">ECAM · ENG</span>
        <span className="hud text-emerald-300 text-[7px]">CRZ</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <EngineColumn label="ENG 1" n1={vals.n1L} egt={vals.egtL} ff={vals.ffL} />
        <EngineColumn label="ENG 2" n1={vals.n1R} egt={vals.egtR} ff={vals.ffR} />
      </div>
    </div>
  );
}

function EngineColumn({
  label,
  n1,
  egt,
  ff,
}: {
  label: string;
  n1: number;
  egt: number;
  ff: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="hud text-white/40 text-[6px]">{label}</span>
        <span className="hud text-emerald-300 text-[6px]">●</span>
      </div>
      <ParamBar label="N1" value={n1} max={100} unit="%" color="#00ff7e" />
      <ParamBar label="EGT" value={egt} max={900} unit="°C" color="#00d4ff" />
      <ParamBar label="FF" value={ff} max={3} unit="t/h" color="#ffd84d" decimals={1} />
    </div>
  );
}

function ParamBar({
  label,
  value,
  max,
  unit,
  color,
  decimals = 0,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  decimals?: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-1">
      <span className="hud text-white/40 text-[6px] w-4">{label}</span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden relative"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span
        className="font-mono tabular-nums text-[7px] w-7 text-right"
        style={{ color, textShadow: `0 0 3px ${color}80` }}
      >
        {value.toFixed(decimals)}
      </span>
    </div>
  );
}

/* ─── 4. PEDESTAL (throttle quadrant + side stick suggestion) ───────────── */

function Pedestal() {
  const [thr, setThr] = useState(78);
  useEffect(() => {
    const id = setInterval(() => {
      setThr((v) => Math.max(72, Math.min(85, v + (Math.random() < 0.5 ? -1 : 1))));
    }, 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="relative rounded p-2"
      style={{
        background:
          "linear-gradient(180deg, #1a1f2c 0%, #0a0c14 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-2">
        {/* Throttle quadrant */}
        <div className="flex-1 flex items-center gap-1.5">
          <span className="hud text-white/40 text-[6px]">THR</span>
          <ThrottleLever pct={thr} />
          <ThrottleLever pct={thr - 1} />
          <span
            className="font-mono tabular-nums text-amber-300 text-[7px] ml-1"
            style={{ textShadow: "0 0 3px rgba(255,180,77,0.7)" }}
          >
            CL
          </span>
        </div>
        {/* MCDU mini display */}
        <div
          className="flex flex-col items-center px-1.5 py-1 rounded"
          style={{
            background: "#000",
            border: "1px solid rgba(0,191,255,0.25)",
            minWidth: 64,
          }}
        >
          <span className="hud text-cyan-300/70 text-[6px]">MCDU</span>
          <span
            className="font-mono font-bold tabular-nums text-emerald-300 text-[7px]"
            style={{ textShadow: "0 0 3px rgba(0,255,126,0.6)" }}
          >
            CDG ▸ JFK
          </span>
          <span className="font-mono text-white/40 text-[6px]">7H 12M</span>
        </div>
      </div>
      {/* Bottom rivets */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
    </div>
  );
}

function ThrottleLever({ pct }: { pct: number }) {
  // pct 0..100 maps to lever vertical position
  const top = 100 - pct;
  return (
    <div
      className="relative w-3 h-8 rounded-sm overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #1a1f2c 0%, #0a0c14 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Slot tick marks */}
      <div className="absolute inset-x-0 top-1/4 h-px bg-white/5" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
      <div className="absolute inset-x-0 top-3/4 h-px bg-white/5" />
      {/* Lever knob */}
      <motion.div
        className="absolute left-0 right-0 h-1.5 rounded-sm"
        style={{
          background:
            "linear-gradient(180deg, #d8dde6 0%, #5a6070 50%, #2a2d38 100%)",
          boxShadow: "0 0 4px rgba(255,255,255,0.2), 0 1px 0 rgba(0,0,0,0.5)",
        }}
        animate={{ top: `${top}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
