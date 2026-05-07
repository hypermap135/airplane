"use client";

/**
 * HERO V1 — "Flight Deck"
 * Editorial split: massive chrome typography on the left,
 * realistic glass-cockpit instrument panel on the right
 * (Attitude Indicator, Airspeed, Altimeter, Heading, VS).
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
 * GLASS COCKPIT — realistic instrument panel
 * Inspired by modern PFD (Primary Flight Display) layouts: large circular
 * Attitude Indicator at top, six-pack of round gauges below, data strip.
 * ════════════════════════════════════════════════════════════════════════ */

function InstrumentPanel() {
  return (
    <div className="relative">
      {/* Outer panel chassis */}
      <div
        className="relative rounded-[1.5rem] p-3 sm:p-4"
        style={{
          background:
            "linear-gradient(160deg, rgba(20,22,32,0.95) 0%, rgba(8,8,14,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
        }}
      >
        {/* Bezel screws (corners) */}
        {[
          { top: 10, left: 10 },
          { top: 10, right: 10 },
          { bottom: 10, left: 10 },
          { bottom: 10, right: 10 },
        ].map((pos, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              ...pos,
              background:
                "radial-gradient(circle at 30% 30%, #2a2d38, #0a0a10)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          />
        ))}

        {/* Top: Attitude Indicator (large, dominant) */}
        <AttitudeIndicator />

        {/* Mid: 2-up dials (Airspeed + Altimeter) */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <AirspeedDial />
          <AltimeterDial />
        </div>

        {/* Bottom: Heading compass + data */}
        <div className="grid grid-cols-[1fr_1fr] gap-3 mt-3">
          <HeadingIndicator />
          <VerticalSpeedIndicator />
        </div>

        {/* Bottom data strip */}
        <div
          className="mt-3 px-3 py-2.5 rounded-lg flex items-center justify-between gap-3"
          style={{
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </span>
            <span className="hud text-emerald-300/80">FLT · AS-001</span>
          </div>
          <span className="hud text-[#3a8eff] tabular-nums">FR &amp; EU</span>
        </div>

        {/* Subtle glass reflection overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.5rem]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Attitude Indicator (Artificial Horizon) ──────────────────────────── */

function AttitudeIndicator() {
  const [bank, setBank] = useState(0);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.012;
      setBank(Math.sin(t) * 4.5);
      setPitch(Math.cos(t * 1.3) * 2.5);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="relative aspect-[16/9] rounded-xl overflow-hidden"
      style={{
        background: "#000",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.7)",
      }}
    >
      {/* Sky / ground (rotated by bank, translated by pitch) */}
      <motion.div
        aria-hidden
        className="absolute"
        style={{
          inset: "-50%",
          rotate: bank,
          y: pitch * 4,
          background:
            "linear-gradient(180deg, #1a4677 0%, #2563ad 38%, #2c6fb8 50%, #5a3a1c 50.2%, #3d2614 70%, #1f1308 100%)",
        }}
      />

      {/* Pitch ladder (sky side) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ rotate: bank, y: pitch * 4 }}
      >
        {[20, 10, -10, -20].map((deg) => (
          <div
            key={deg}
            className="absolute flex items-center gap-2"
            style={{ top: `calc(50% - ${deg}px)`, transform: "translateY(-50%)" }}
          >
            <span className="hud text-white/55 text-[8px]">{Math.abs(deg)}</span>
            <div
              className="bg-white/55"
              style={{ width: deg % 20 === 0 ? 30 : 18, height: 1 }}
            />
            <span className="hud text-white/55 text-[8px]">{Math.abs(deg)}</span>
          </div>
        ))}
      </motion.div>

      {/* Bank arc with markers */}
      <svg
        aria-hidden
        viewBox="0 0 200 80"
        className="absolute inset-x-0 top-0 w-full"
        style={{ height: "60%" }}
      >
        <g stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none">
          {[-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const r = 70;
            const cx = 100;
            const cy = 80;
            const x1 = cx + Math.sin(rad) * r;
            const y1 = cy - Math.cos(rad) * r;
            const len = angle % 30 === 0 ? 7 : 4;
            const x2 = cx + Math.sin(rad) * (r + len);
            const y2 = cy - Math.cos(rad) * (r + len);
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        {/* Bank pointer (rotates with bank) */}
        <g style={{ transform: `rotate(${-bank}deg)`, transformOrigin: "100px 80px" }}>
          <polygon
            points="100,8 96,16 104,16"
            fill="#3a8eff"
            stroke="#fff"
            strokeWidth="0.5"
          />
        </g>
      </svg>

      {/* Center aircraft symbol (fixed, doesn't rotate) */}
      <svg
        aria-hidden
        viewBox="0 0 200 100"
        className="absolute inset-0 w-full h-full"
      >
        {/* Wings */}
        <g fill="none" stroke="#ffd84d" strokeWidth="2.5" strokeLinecap="square">
          <line x1="60" y1="50" x2="85" y2="50" />
          <line x1="115" y1="50" x2="140" y2="50" />
        </g>
        {/* Stub */}
        <rect x="98" y="50" width="4" height="6" fill="#ffd84d" />
        {/* Center dot */}
        <circle cx="100" cy="50" r="2" fill="#ffd84d" />
      </svg>

      {/* Side labels */}
      <div className="absolute top-2 left-3 hud text-white/55 text-[9px]">ATT</div>
      <div className="absolute top-2 right-3 hud text-[#3a8eff] text-[9px] tabular-nums">
        {bank.toFixed(1)}°
      </div>

      {/* Glass curvature highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.08), transparent 60%)",
        }}
      />
    </div>
  );
}

/* ─── Circular gauge primitive ─────────────────────────────────────────── */

type GaugeProps = {
  label: string;
  value: string;
  unit?: string;
  needleAngle: number; // -135 to +135 typical
  ticks?: number[];
  ticksMajor?: number[];
  color?: string;
};

function CircularGauge({
  label,
  value,
  unit,
  needleAngle,
  ticks = Array.from({ length: 27 }, (_, i) => -135 + i * 10), // every 10°
  ticksMajor = Array.from({ length: 7 }, (_, i) => -135 + i * 45), // every 45°
  color = "#3a8eff",
}: GaugeProps) {
  return (
    <div
      className="relative aspect-square rounded-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #0a0c14 0%, #050608 70%, #02030a 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.04), inset 0 -2px 8px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      {/* Outer bezel ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02), rgba(255,255,255,0.06), rgba(255,255,255,0.01), rgba(255,255,255,0.08))",
          padding: "2%",
          WebkitMask:
            "radial-gradient(circle, transparent 88%, #000 88%, #000 100%)",
          mask: "radial-gradient(circle, transparent 88%, #000 88%, #000 100%)",
        }}
      />

      {/* Tick marks */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        <g>
          {ticks.map((deg) => {
            const isMajor = ticksMajor.includes(deg);
            const rad = (deg * Math.PI) / 180;
            const r1 = 42;
            const r2 = isMajor ? 36 : 39;
            const x1 = 50 + Math.sin(rad) * r1;
            const y1 = 50 - Math.cos(rad) * r1;
            const x2 = 50 + Math.sin(rad) * r2;
            const y2 = 50 - Math.cos(rad) * r2;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)"}
                strokeWidth={isMajor ? 1.2 : 0.6}
              />
            );
          })}
        </g>

        {/* Needle */}
        <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: "50px 50px", transition: "transform 0.6s ease-out" }}>
          <polygon
            points="50,10 48.5,52 51.5,52"
            fill={color}
            opacity="0.95"
          />
          <circle cx="50" cy="50" r="2.5" fill={color} />
          <circle cx="50" cy="50" r="1" fill="#000" />
        </g>
      </svg>

      {/* Center digital readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: "20%" }}>
        <span
          className="font-mono font-bold tabular-nums leading-none text-white"
          style={{ fontSize: "0.95rem", letterSpacing: "-0.02em", textShadow: "0 0 6px rgba(58,142,255,0.4)" }}
        >
          {value}
        </span>
        {unit && (
          <span className="hud text-white/45 text-[8px] mt-0.5">{unit}</span>
        )}
      </div>

      {/* Top label */}
      <div
        className="absolute left-0 right-0 text-center hud text-white/55 text-[8px]"
        style={{ top: "12%" }}
      >
        {label}
      </div>

      {/* Glass reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)",
        }}
      />
    </div>
  );
}

/* ─── Airspeed (knots) ────────────────────────────────────────────────── */

function AirspeedDial() {
  const [kt, setKt] = useState(478);
  useEffect(() => {
    const id = setInterval(() => {
      setKt((v) => Math.max(440, Math.min(510, v + Math.round((Math.random() - 0.5) * 6))));
    }, 1100);
    return () => clearInterval(id);
  }, []);
  // map 0..600 kt to -135..+135
  const angle = -135 + (Math.min(kt, 600) / 600) * 270;
  return (
    <CircularGauge
      label="AIRSPEED · KT"
      value={kt.toString()}
      unit="MACH 0.82"
      needleAngle={angle}
      color="#3a8eff"
    />
  );
}

/* ─── Altimeter (ft) ──────────────────────────────────────────────────── */

function AltimeterDial() {
  const [alt, setAlt] = useState(36000);
  useEffect(() => {
    const id = setInterval(() => {
      setAlt((v) => v + Math.round((Math.random() - 0.5) * 40));
    }, 900);
    return () => clearInterval(id);
  }, []);
  // hundreds hand (0..1000ft -> full 360°)
  const hundreds = alt % 1000;
  const angle = (hundreds / 1000) * 360;
  return (
    <CircularGauge
      label="ALT · FT"
      value={alt.toLocaleString("fr-FR")}
      unit="QNH 1013"
      needleAngle={angle}
      color="#e6ecff"
      ticks={Array.from({ length: 36 }, (_, i) => i * 10)}
      ticksMajor={Array.from({ length: 10 }, (_, i) => i * 36)}
    />
  );
}

/* ─── Heading (compass) ───────────────────────────────────────────────── */

function HeadingIndicator() {
  const [hdg, setHdg] = useState(132);
  useEffect(() => {
    const id = setInterval(() => {
      setHdg((v) => (v + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 0 : 1) + 360) % 360);
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="relative aspect-square rounded-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #0a0c14 0%, #050608 70%, #02030a 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.04), inset 0 -2px 8px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      {/* Compass card rotates with -hdg so current heading is at top */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ transform: `rotate(${-hdg}deg)`, transition: "transform 0.8s ease-out" }}
      >
        {/* Cardinal letters */}
        {[
          { label: "N", deg: 0, color: "#ff4d4d" },
          { label: "E", deg: 90, color: "rgba(255,255,255,0.7)" },
          { label: "S", deg: 180, color: "rgba(255,255,255,0.7)" },
          { label: "W", deg: 270, color: "rgba(255,255,255,0.7)" },
        ].map(({ label, deg, color }) => {
          const rad = (deg * Math.PI) / 180;
          const r = 32;
          const x = 50 + Math.sin(rad) * r;
          const y = 50 - Math.cos(rad) * r;
          return (
            <text
              key={label}
              x={x}
              y={y}
              fill={color}
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${x}px ${y}px` }}
              fontFamily="monospace"
            >
              {label}
            </text>
          );
        })}
        {/* Tick marks every 10° */}
        {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
          const isMajor = deg % 30 === 0;
          const rad = (deg * Math.PI) / 180;
          const r1 = 44;
          const r2 = isMajor ? 39 : 41;
          const x1 = 50 + Math.sin(rad) * r1;
          const y1 = 50 - Math.cos(rad) * r1;
          const x2 = 50 + Math.sin(rad) * r2;
          const y2 = 50 - Math.cos(rad) * r2;
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)"}
              strokeWidth={isMajor ? 0.8 : 0.4}
            />
          );
        })}
      </svg>

      {/* Fixed aircraft symbol pointing up */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <g fill="#ffd84d" stroke="rgba(0,0,0,0.5)" strokeWidth="0.3">
          <polygon points="50,32 47,55 53,55" />
          <rect x="40" y="48" width="20" height="2" />
          <rect x="46" y="58" width="8" height="1.5" />
        </g>
      </svg>

      {/* Top heading bug */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "4%" }}
      >
        <svg width="10" height="6" viewBox="0 0 10 6">
          <polygon points="0,0 10,0 5,6" fill="#3a8eff" />
        </svg>
      </div>

      {/* Digital readout */}
      <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
        <div
          className="px-1.5 py-0.5 rounded font-mono font-bold tabular-nums text-white text-[0.7rem]"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(58,142,255,0.4)",
            textShadow: "0 0 4px rgba(58,142,255,0.6)",
          }}
        >
          {hdg.toString().padStart(3, "0")}°
        </div>
      </div>

      {/* Top label */}
      <div
        className="absolute left-0 right-0 text-center hud text-white/55 text-[8px]"
        style={{ top: "16%" }}
      >
        HDG
      </div>

      {/* Glass reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)",
        }}
      />
    </div>
  );
}

/* ─── Vertical Speed (ft/min) ─────────────────────────────────────────── */

function VerticalSpeedIndicator() {
  const [vs, setVs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setVs(Math.round((Math.random() - 0.5) * 400));
    }, 1300);
    return () => clearInterval(id);
  }, []);
  // Map -2000..+2000 fpm to -135..+135 (zero at 9 o'clock)
  const angle = -90 + (Math.max(-2000, Math.min(2000, vs)) / 2000) * 90;
  return (
    <CircularGauge
      label="VS · FPM"
      value={vs > 0 ? `+${vs}` : vs.toString()}
      unit="LEVEL"
      needleAngle={angle}
      color="#7ee08c"
      ticks={Array.from({ length: 19 }, (_, i) => -90 + i * 10)}
      ticksMajor={[-90, -45, 0, 45, 90]}
    />
  );
}
