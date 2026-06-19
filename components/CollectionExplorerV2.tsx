"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { PRODUCTS, type Product } from "@/lib/products";

/**
 * CollectionExplorerV2 — shoppy 6-up grid + category strip.
 *
 * Replaces the editorial carousel (which felt too "exhibition" and
 * surfaced out-of-stock planes) with a clean shop layout:
 *  - 6 in-stock hero airplanes in a 3×2 grid using ProductCard so the
 *    image, price and "+ Panier" button are visible at a glance.
 *  - "Voir tout le catalogue →" CTA below to push deep-divers to /collections/all.
 *  - 4 category tiles (Airbus / Boeing / Concorde / Jet) further down.
 *
 * The hero lineup is HAND-PICKED but auto-filtered against the live
 * inStock + comingSoon flags so anything that goes out of stock drops
 * silently and gets backfilled.
 */

// Preference order — we keep the first 6 entries that are actually
// in stock. Cross-family on purpose so the grid shows breadth.
const PREFERRED_HANDLES = [
  "maquette-avion-maquette-airbus-a380",          // A380 AF (bestseller)
  "concorde-airfrance",                            // Concorde AF (icon)
  "maquette-avion-maquette-boeing-747",            // B747 AF (Queen of the Skies)
  "maquette-avion-maquette-airbus-a350-airfrance", // A350 AF (new-gen)
  "boeing-787",                                    // B787 AF (Dreamliner)
  "jet-prive",                                     // Gulfstream G650 (jet privé)
  // Fallbacks if any of the above goes out of stock:
  "concorde-british",
  "airbus-a220-air-france",
  "boeing-777",
  "a-321",
  "concorde-airfrance-30cm",
];

const CATEGORY_TILES: { slug: string; label: string; accent: string }[] = [
  { slug: "airbus",   label: "Airbus",    accent: "#3a8eff" },
  { slug: "boeing",   label: "Boeing",    accent: "#d97706" },
  { slug: "concorde", label: "Concorde",  accent: "#9333ea" },
  { slug: "jet",      label: "Jet privé", accent: "#a78bfa" },
];

export default function CollectionExplorerV2() {
  // Pull the first 6 preferred handles that are actually buyable today.
  const heroes: Product[] = PREFERRED_HANDLES
    .map((h) => PRODUCTS.find((p) => p.handle === h))
    .filter((p): p is Product => Boolean(p) && p!.inStock && !p!.comingSoon)
    .slice(0, 6);

  const countByCollection = (slug: string) =>
    PRODUCTS.filter((p) => p.collection === slug && p.inStock).length;

  return (
    <section
      className="relative"
      style={{
        background: "#030308",
        paddingTop: "5rem",
        paddingBottom: "5rem",
      }}
    >
      {/* ── HEADER ── */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 mb-10 md:mb-14">
        <div className="flex items-center gap-3 mb-5">
          <div aria-hidden style={{ width: 28, height: 1, background: "rgba(58,142,255,0.55)" }} />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.32em",
              color: "rgba(120,180,255,0.85)",
            }}
          >
            ★ Toute la flotte
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            className="font-black text-white"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.6rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              background: "linear-gradient(180deg,#fff 0%,#cfd6e4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Les icônes,<br/>une à une.
          </h2>

          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            Voir tout le catalogue →
          </Link>
        </div>
      </div>

      {/* ── 6-UP SHOPPY GRID ── */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20">
        <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {heroes.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* ── CATEGORY TILES ── */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 mt-16 md:mt-24">
        <div className="flex items-center gap-3 mb-6">
          <div aria-hidden style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }} />
          <span
            className="font-mono uppercase text-white/60"
            style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}
          >
            Ou explorez par famille
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORY_TILES.map((c) => (
            <CategoryTile
              key={c.slug}
              slug={c.slug}
              label={c.label}
              accent={c.accent}
              count={countByCollection(c.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CategoryTile — collection card with giant faded background label ──── */

function CategoryTile({
  slug,
  label,
  accent,
  count,
}: {
  slug: string;
  label: string;
  accent: string;
  count: number;
}) {
  return (
    <Link
      href={`/collections/${slug}`}
      className="group relative overflow-hidden transition-all"
      style={{
        aspectRatio: "5/4",
        borderRadius: 16,
        background: `linear-gradient(160deg, ${accent}10 0%, #030308 70%)`,
        border: `1px solid ${accent}22`,
      }}
    >
      <span
        aria-hidden
        className="absolute font-black uppercase select-none"
        style={{
          fontSize: "clamp(4rem, 10vw, 8rem)",
          letterSpacing: "-0.06em",
          lineHeight: 0.85,
          color: accent,
          opacity: 0.08,
          top: "-0.1em",
          right: "-0.05em",
          pointerEvents: "none",
        }}
      >
        {label}
      </span>

      <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-6">
        <p
          className="font-mono uppercase"
          style={{
            fontSize: "0.58rem",
            letterSpacing: "0.24em",
            color: `${accent}cc`,
          }}
        >
          {count} modèle{count > 1 ? "s" : ""}
        </p>

        <div>
          <h3
            className="font-black text-white mb-1.5"
            style={{
              fontSize: "clamp(1.2rem, 2.4vw, 1.8rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {label}
          </h3>
          <span
            className="font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              fontSize: "0.58rem",
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Voir la collection →
          </span>
        </div>
      </div>
    </Link>
  );
}
