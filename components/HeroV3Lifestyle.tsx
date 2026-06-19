"use client";

/**
 * HERO V3 — "Lifestyle Bureau"
 * Full-bleed lifestyle shot of premium airplane models staged on a
 * collector's walnut desk (laptop, brass lamp, leather notebook).
 * The product itself IS the hero — no cockpit chrome, no boarding
 * pass, no fake telemetry. Editorial tagline + dual CTA bottom-left,
 * top-right "edition" pill for catalog vibe.
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroV3Lifestyle() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: "min(92vh, 900px)",
        minHeight: 560,
        background: "#0a0a12",
      }}
      aria-label="AirplaneStore — maquettes d'exception"
    >
      {/* ── Hero photograph ── */}
      <Image
        src="/images/pack-prestige-air-france.png"
        alt="Pack Prestige Air France — trois maquettes sur un bureau"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "center 60%" }}
      />

      {/* Vignettes for legibility — soft black gradient at the bottom
          (text band) and a subtle one at the top (chrome / pill) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,18,0.65) 0%, rgba(10,10,18,0.0) 18%, rgba(10,10,18,0.0) 45%, rgba(10,10,18,0.85) 100%)",
        }}
      />

      {/* ── Top-right edition pill ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-10 flex items-center gap-3"
      >
        <span
          className="font-mono uppercase"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          ✦ N°001 · Édition 2026
        </span>
      </motion.div>

      {/* ── Top-left brand crumb ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
        className="absolute top-6 left-6 md:top-10 md:left-12 z-10 flex items-center gap-3"
      >
        <div
          aria-hidden
          style={{
            width: 28,
            height: 1,
            background: "rgba(58,142,255,0.65)",
          }}
        />
        <span
          className="font-mono uppercase"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            color: "rgba(58,142,255,0.75)",
          }}
        >
          ★ Airplanestore · Collection
        </span>
      </motion.div>

      {/* ── Editorial tagline (bottom-left) ── */}
      <div
        className="absolute left-0 right-0 z-10"
        style={{
          bottom: "clamp(2.5rem, 7vh, 5rem)",
          padding: "0 clamp(1.5rem, 6vw, 4rem)",
        }}
      >
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-black text-white"
            style={{
              fontSize: "clamp(2.4rem, 6.5vw, 5.2rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.025em",
            }}
          >
            Maquettes
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #ffffff 0%, #c8ccd2 60%, #888 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              d&apos;exception.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-5"
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
              color: "rgba(255,255,255,0.78)",
              maxWidth: 560,
              lineHeight: 1.55,
            }}
          >
            Maquettes d&apos;avions premium, fait en France. Résine monobloc,
            finition main, LED intégré au socle, activation au toucher.
            Livraison France &amp; Europe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/#collection"
              className="font-bold inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
              style={{
                background: "#fff",
                color: "#06060f",
                padding: "0.95rem 1.8rem",
                borderRadius: 999,
                fontSize: "0.85rem",
                letterSpacing: "0.04em",
              }}
            >
              Entrer dans la collection
              <span aria-hidden style={{ fontSize: "1.1em" }}>
                →
              </span>
            </Link>
            <Link
              href="/collections/packs"
              className="font-semibold transition-opacity hover:opacity-100"
              style={{
                color: "rgba(255,255,255,0.85)",
                padding: "0.95rem 1.5rem",
                fontSize: "0.85rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(6px)",
              }}
            >
              Voir les packs
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-4 md:gap-6"
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.08em",
            }}
          >
            <span className="flex items-center gap-1.5">
              <span style={{ color: "#ffd76b" }}>★★★★★</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>4.8/5</span>
              <span>·</span>
              <span>347 avis</span>
            </span>
            <span aria-hidden>·</span>
            <span className="uppercase">Fait en France</span>
            <span aria-hidden>·</span>
            <span className="uppercase">Livraison 7-15j</span>
            <span aria-hidden>·</span>
            <span className="uppercase">Retour 30j</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
