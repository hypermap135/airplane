"use client";

import { motion } from "framer-motion";

/* ─── Trust items ─────────────────────────────────────────────────────────── */

const ITEMS = [
  {
    label: "4.8/5",
    sub: "1 847 avis",
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5l1.95 4.27 4.55.55-3.4 3.18.93 4.5L8 11.7l-4.03 2.3.93-4.5-3.4-3.18 4.55-.55L8 1.5z"
          fill="url(#g-star)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="g-star" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe28a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: "Livraison",
    sub: "France & Europe",
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h7v6H2V4zm7 2h3l2 2v2h-5V6zM4 12a1 1 0 102 0 1 1 0 00-2 0zm6 0a1 1 0 102 0 1 1 0 00-2 0z"
          stroke="#3a8eff"
          strokeWidth="1.1"
          strokeLinejoin="round"
          fill="rgba(58,142,255,0.08)"
        />
      </svg>
    ),
  },
  {
    label: "Retour 30j",
    sub: "Sans condition",
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8a5 5 0 0110-1m0 1a5 5 0 01-10 1"
          stroke="#3a8eff"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M3 5v3h3M13 11V8h-3" stroke="#3a8eff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    label: "Paiement",
    sub: "100% sécurisé",
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="6" width="10" height="8" rx="1.2" stroke="#3a8eff" strokeWidth="1.1" fill="rgba(58,142,255,0.06)" />
        <path d="M5 6V4.5a3 3 0 016 0V6" stroke="#3a8eff" strokeWidth="1.1" fill="none" />
        <circle cx="8" cy="10" r="1" fill="#3a8eff" />
      </svg>
    ),
  },
  {
    label: "Résine premium",
    sub: "Atelier Paris",
    Icon: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5l5.5 3v5L8 14.5 2.5 9.5v-5L8 1.5z"
          stroke="url(#g-diamond)"
          strokeWidth="1.1"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.04)"
        />
        <path d="M2.5 4.5L8 7.5l5.5-3M8 7.5v7" stroke="url(#g-diamond)" strokeWidth="0.8" />
        <defs>
          <linearGradient id="g-diamond" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6ecff" />
            <stop offset="100%" stopColor="#3a8eff" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

/* ─── Single chip ─────────────────────────────────────────────────────────── */

function TrustChip({
  Icon,
  label,
  sub,
  delay = 0,
}: {
  Icon: React.ComponentType;
  label: string;
  sub: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="trust-chip group relative inline-flex items-center gap-3 shrink-0 px-4 py-2.5"
      style={{
        borderRadius: 999,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      {/* Gradient halo on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderRadius: 999,
          background:
            "linear-gradient(135deg, rgba(58,142,255,0.18), transparent 60%)",
          filter: "blur(8px)",
          zIndex: -1,
        }}
      />
      {/* Animated border on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          borderRadius: 999,
          padding: 1,
          background:
            "linear-gradient(135deg, rgba(58,142,255,0.5), rgba(255,255,255,0.15) 50%, rgba(58,142,255,0.4))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <span className="relative shrink-0">
        <Icon />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className="font-bold text-white text-[0.72rem] tracking-tight"
          style={{ letterSpacing: "-0.01em" }}
        >
          {label}
        </span>
        <span
          className="font-mono text-[0.52rem] tracking-[0.16em] uppercase mt-1"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          {sub}
        </span>
      </span>
    </motion.div>
  );
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function TrustBar() {
  /* Triple the items so the marquee seam is invisible */
  const marqueeItems = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div
      className="relative"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,8,18,0.85) 0%, rgba(4,4,12,0.85) 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Subtle scan line */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(58,142,255,0.5) 50%, transparent 100%)",
        }}
      />

      {/* ── Desktop: static row of glass chips ── */}
      <div
        className="hidden md:flex items-center justify-center gap-3 lg:gap-4 py-5 px-6 flex-wrap"
        aria-label="Garanties AirplaneStore"
      >
        {ITEMS.map((item, i) => (
          <TrustChip key={i} {...item} delay={i * 0.06} />
        ))}
      </div>

      {/* ── Mobile: auto-scrolling marquee of chips ── */}
      <div
        className="md:hidden relative overflow-hidden py-4"
        aria-label="Garanties AirplaneStore"
      >
        {/* Fade edges */}
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,4,12,0.95) 0%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(270deg, rgba(4,4,12,0.95) 0%, transparent 100%)",
          }}
        />

        <div
          className="trust-marquee-track flex items-center gap-3"
          style={{ width: "max-content" }}
        >
          {marqueeItems.map((item, i) => (
            <TrustChip key={i} {...item} />
          ))}
        </div>
      </div>

      {/* Scoped keyframes */}
      <style>{`
        @keyframes trust-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        .trust-marquee-track {
          animation: trust-scroll 28s linear infinite;
        }
        .trust-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
