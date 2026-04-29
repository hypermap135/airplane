import { notFound } from "next/navigation";
import CatalogueGrid from "@/components/CatalogueGrid";
import SectionHeading from "@/components/SectionHeading";
import { COLLECTIONS, byCollection, type Collection } from "@/lib/products";

const SUBTITLES: Record<Collection, string> = {
  airbus:      "A220, A320, A321, A350, A380 — toute la famille Airbus en résine monobloc.",
  boeing:      "737, 747, 777, 787 Dreamliner — les légendes Boeing, dont Air Force One.",
  concorde:    "Le supersonique, en livrées Air France et British Airways. Une pièce hors du temps.",
  chasse:      "Rafale, Mirage 2000, F16 — l'aviation militaire française, coulée dans la résine.",
  jet:         "La grande classe des airs. Jets d'affaires longue distance — pour les collections d'exception.",
  packs:       "Deux maquettes ou trois — constituez une collection d'un seul geste.",
  accessoires: "Porte-clés, horloges, gravures — la touche finale pour compléter votre collection.",
};

/** Per-collection hero gradient and accent color */
const HERO_THEMES: Record<Collection, { gradient: string; accent: string }> = {
  airbus:      { gradient: "linear-gradient(135deg, #0a0f2a 0%, #0d1e40 40%, #030308 100%)", accent: "#1a4aff" },
  boeing:      { gradient: "linear-gradient(135deg, #0e0a02 0%, #2a1500 40%, #030308 100%)", accent: "#d97706" },
  concorde:    { gradient: "linear-gradient(135deg, #0f0010 0%, #250030 40%, #030308 100%)", accent: "#9333ea" },
  chasse:      { gradient: "linear-gradient(135deg, #000f04 0%, #001a06 40%, #030308 100%)", accent: "#22c55e" },
  jet:         { gradient: "linear-gradient(135deg, #0a0a0f 0%, #15102a 40%, #030308 100%)", accent: "#a78bfa" },
  packs:       { gradient: "linear-gradient(135deg, #0a0608 0%, #200a10 40%, #030308 100%)", accent: "#e11d48" },
  accessoires: { gradient: "linear-gradient(135deg, #080808 0%, #141414 40%, #030308 100%)", accent: "#94a3b8" },
};

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export function generateMetadata({ params }: { params: { collection: string } }) {
  const match = COLLECTIONS.find((c) => c.slug === params.collection);
  if (!match) return { title: "Collection" };
  return {
    title: `${match.label} — Maquettes d'avion en résine`,
    description: SUBTITLES[match.slug],
  };
}

export default function CollectionPage({ params }: { params: { collection: string } }) {
  const match = COLLECTIONS.find((c) => c.slug === params.collection);
  if (!match) notFound();

  const products = byCollection(match.slug);
  const theme = HERO_THEMES[match.slug];

  return (
    <div style={{ background: "#030308", minHeight: "100vh" }}>

      {/* ── Hero stripe ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: theme.gradient,
          paddingTop: "7rem",
          paddingBottom: "4rem",
        }}
      >
        {/* Large background label */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-end pr-10 md:pr-20 pointer-events-none select-none"
        >
          <span
            className="font-black uppercase"
            style={{
              fontSize: "clamp(6rem, 18vw, 18rem)",
              letterSpacing: "-0.06em",
              lineHeight: 0.85,
              color: theme.accent,
              opacity: 0.06,
              userSelect: "none",
            }}
          >
            {match.label}
          </span>
        </div>

        {/* Accent glow */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${theme.accent}18 0%, transparent 65%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20">
          <SectionHeading
            eyebrow={`★ COLLECTION · ${match.label.toUpperCase()}`}
            title={match.label}
            subtitle={SUBTITLES[match.slug]}
          />
        </div>
      </div>

      {/* ── Products ────────────────────────────────────────────────── */}
      {/*
        CatalogueGrid already renders collection filter pills + sort controls
        via its built-in showFilters prop (default true). No duplication needed.
      */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 pt-12 pb-24">
        <CatalogueGrid products={products} activeCollection={match.slug} />
      </div>
    </div>
  );
}
