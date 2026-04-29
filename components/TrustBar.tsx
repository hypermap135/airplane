"use client";

import { useRef, useEffect } from "react";

const ITEMS = [
  { icon: "★", text: "4.9/5 — 2 000+ avis clients" },
  { icon: "🚚", text: "Livraison France & Europe" },
  { icon: "↩️", text: "Retour 30 jours" },
  { icon: "🔒", text: "Paiement 100% sécurisé" },
  { icon: "✦",  text: "Résine premium · Made in Asia" },
];

export default function TrustBar() {
  const trackRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll on mobile via CSS-only marquee; on desktop items are static. */
  useEffect(() => {
    /* Nothing JS-driven — we rely on CSS animation below for the marquee. */
  }, []);

  /* Triple the items so the marquee seam is invisible */
  const marqueeItems = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ── Desktop: static row ── */}
      <div
        className="hidden md:flex items-center justify-center gap-8 py-4 px-6 flex-wrap"
        aria-label="Garanties AirplaneStore"
      >
        {ITEMS.map(({ icon, text }, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span
              className="text-[0.75rem]"
              aria-hidden
              style={{ color: "rgba(58,142,255,0.7)" }}
            >
              {icon}
            </span>
            <span
              className="font-mono text-[0.6rem] tracking-[0.15em] uppercase"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* ── Mobile: auto-scrolling marquee ── */}
      <div
        className="md:hidden relative overflow-hidden py-4"
        aria-label="Garanties AirplaneStore"
      >
        {/* Fade edges */}
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(6,6,15,0.9) 0%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(270deg, rgba(6,6,15,0.9) 0%, transparent 100%)",
          }}
        />

        <div
          ref={trackRef}
          className="trust-marquee-track flex"
          style={{ width: "max-content" }}
        >
          {marqueeItems.map(({ icon, text }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 shrink-0"
              style={{ margin: "0 1.75rem" }}
            >
              <span
                className="text-[0.75rem]"
                aria-hidden
                style={{ color: "rgba(58,142,255,0.7)" }}
              >
                {icon}
              </span>
              <span
                className="font-mono text-[0.6rem] tracking-[0.15em] uppercase"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes — scoped, no global CSS file needed */}
      <style>{`
        @keyframes trust-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        .trust-marquee-track {
          animation: trust-scroll 22s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
