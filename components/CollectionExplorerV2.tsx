"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, type Product } from "@/lib/products";

/**
 * CollectionExplorerV2 — spec-sheet rows + category strip.
 *
 * No more cards. Each plane is a horizontal row: tiny square thumb,
 * collection / scale eyebrow, title, price, hover arrow → PDP. Reads
 * like an editorial catalogue index (Apple Store online, Aimé Leon
 * Dore). Auto-filters against inStock + comingSoon so out-of-stock
 * planes never show.
 */

const PREFERRED_HANDLES = [
  "maquette-avion-maquette-airbus-a380",          // A380 AF
  "concorde-airfrance",                            // Concorde AF
  "maquette-avion-maquette-boeing-747",            // B747 AF
  "maquette-avion-maquette-airbus-a350-airfrance", // A350 AF
  "boeing-787",                                    // B787 AF
  "jet-prive",                                     // Gulfstream
  "concorde-british",
  "airbus-a220-air-france",
  "boeing-777",
  "a-321",
];

const CATEGORY_TILES: { slug: string; label: string; accent: string }[] = [
  { slug: "airbus",   label: "Airbus",    accent: "#3a8eff" },
  { slug: "boeing",   label: "Boeing",    accent: "#d97706" },
  { slug: "concorde", label: "Concorde",  accent: "#9333ea" },
  { slug: "jet",      label: "Jet privé", accent: "#a78bfa" },
];

export default function CollectionExplorerV2({ catalogue }: { catalogue: Product[] }) {
  const rows: Product[] = PREFERRED_HANDLES
    .map((h) => catalogue.find((p) => p.handle === h))
    .filter((p): p is Product => Boolean(p) && p!.inStock && !p!.comingSoon)
    .slice(0, 8);

  const countByCollection = (slug: string) =>
    catalogue.filter((p) => p.collection === slug && p.inStock).length;

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
      <div className="mx-auto max-w-[1100px] px-6 md:px-12 mb-12 md:mb-16">
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
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-100"
            style={{
              padding: "0.6rem 0",
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
            }}
          >
            Voir tout →
          </Link>
        </div>
      </div>

      {/* ── SPEC-SHEET ROWS ── */}
      <div className="mx-auto max-w-[1100px] px-6 md:px-12">
        <div
          aria-hidden
          style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 0 }}
        />
        <ul>
          {rows.map((p) => (
            <SpecRow key={p.id} product={p} />
          ))}
        </ul>
      </div>

      {/* ── CATEGORY TILES ── */}
      <div className="mx-auto max-w-[1100px] px-6 md:px-12 mt-16 md:mt-24">
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

/* ── SpecRow — single-line catalogue entry ──────────────────────────────── */

function SpecRow({ product }: { product: Product }) {
  return (
    <li>
      <Link
        href={`/products/${product.handle}`}
        className="group flex items-center gap-4 md:gap-6 py-4 md:py-5 transition-colors"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "linear-gradient(90deg, rgba(58,142,255,0.05) 0%, transparent 80%)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        {/* Thumbnail */}
        <div
          className="relative shrink-0"
          style={{
            width: 64,
            height: 64,
            borderRadius: 10,
            background: "linear-gradient(145deg,#0c0c1c,#06060f)",
            overflow: "hidden",
          }}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="64px"
            quality={85}
            className="object-contain"
            style={{ padding: "8%" }}
          />
        </div>

        {/* Title + collection eyebrow */}
        <div className="min-w-0 flex-1">
          <p
            className="font-mono uppercase mb-1"
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.24em",
              color: "rgba(120,180,255,0.7)",
            }}
          >
            {product.collection}{product.scale ? ` · ${product.scale}` : ""}
          </p>
          <h3
            className="font-bold text-white truncate"
            style={{
              fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {product.title}
          </h3>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <span
            className="font-mono font-bold text-white"
            style={{
              fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {formatPrice(product.price)}
          </span>
          {product.compareAt && (
            <span
              className="ml-2 text-[0.7rem] line-through hidden md:inline"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>

        {/* Hover arrow */}
        <div
          aria-hidden
          className="shrink-0 transition-transform group-hover:translate-x-1"
          style={{
            width: 24,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </Link>
    </li>
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
