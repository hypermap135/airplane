"use client";

/**
 * HERO V3 — "Lifestyle Bureau" (split editorial)
 * Two-column layout: editorial copy on the left over a dark surface,
 * full lifestyle product photo on the right (no overlay, no text on
 * top of the airplanes — they read cleanly). Stacks vertically on
 * mobile (text above, photo below).
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroV3Lifestyle() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "min(86vh, 820px)",
        background: "#06060f",
      }}
      aria-label="AirplaneStore — maquettes d'exception"
    >
      <div
        className="relative grid w-full h-full"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)",
          minHeight: "min(86vh, 820px)",
        }}
      >
        {/* ── LEFT — editorial copy on dark ── */}
        <div
          className="relative flex flex-col justify-center"
          style={{
            padding: "clamp(2rem, 5vw, 4.5rem) clamp(1.5rem, 4vw, 3.5rem)",
            background:
              "linear-gradient(135deg, #0c0c1c 0%, #07070f 60%, #050510 100%)",
          }}
        >
          {/* small brand crumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
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
              ★ N°001 · Édition 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-black text-white"
            style={{
              fontSize: "clamp(2rem, 5vw, 4.4rem)",
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
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
            className="mt-6"
            style={{
              fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
              color: "rgba(255,255,255,0.72)",
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            Maquettes d&apos;avions premium, fait en France. Résine monobloc,
            finition main, LED intégré au socle, activation au toucher.
            Livraison France &amp; Europe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3"
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
              }}
            >
              Voir les packs
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
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
            <span className="uppercase">Fait en France</span>
            <span className="uppercase">Livraison 7-15j</span>
            <span className="uppercase">Retour 30j</span>
          </motion.div>
        </div>

        {/* ── RIGHT — lifestyle product photo, no overlay ── */}
        <div className="relative" style={{ background: "#0a0a12" }}>
          <Image
            src="/images/pack-prestige-air-france.png"
            alt="Pack Prestige Air France — maquettes A380, A350, B777 sur un bureau collector"
            fill
            priority
            sizes="55vw"
            className="object-cover"
            style={{ objectPosition: "center center" }}
          />
          {/* Soft edge fade on the LEFT only — blends the photo into the
              dark editorial column so there's no harsh seam */}
          <div
            className="absolute inset-y-0 left-0 w-24 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0) 100%)",
            }}
          />
        </div>
      </div>

      {/* Mobile fallback: stack vertically. Implemented via media-query
          class — Tailwind would need a custom variant; raw CSS below
          via a <style jsx> tag isn't needed since we use grid which
          collapses on narrow screens via the inline columns. */}
      <style>{`
        @media (max-width: 768px) {
          section[aria-label="AirplaneStore — maquettes d'exception"] > div {
            grid-template-columns: 1fr !important;
            grid-auto-rows: auto;
          }
          section[aria-label="AirplaneStore — maquettes d'exception"] > div > div:last-child {
            min-height: 50vh;
          }
        }
      `}</style>
    </section>
  );
}
