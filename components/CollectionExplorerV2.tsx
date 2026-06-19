"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, COLLECTIONS, formatPrice, type Product } from "@/lib/products";

/**
 * CollectionExplorerV2 — editorial carousel + category strip.
 *
 * Replaces the dense grid with a slower-paced "icon" feel inspired by
 * Apple, Ami Paris and Aimé Leon Dore:
 *  - A horizontal snap-scroll carousel of 8 hero airplanes (oversized
 *    cards with breathing room, paging arrows, scroll progress bar).
 *  - Below, four big category tiles (Airbus / Boeing / Concorde / Jet)
 *    that funnel deep-divers into the full collection page.
 */

// Hand-picked hero lineup — one per livery / brand / vibe.
const HERO_HANDLES = [
  "maquette-avion-maquette-airbus-a380",          // A380 AF
  "concorde-airfrance",                            // Concorde AF
  "boeing-747-air-force-one",                      // 747 AFO
  "airbus-a350-singapore",                         // A350 SQ
  "airbus-a380-emirates",                          // A380 Emirates
  "boeing-787-etihad-manchester-city",             // 787 Etihad x Man City
  "airbus-a320-neo-transavia",                     // A320 Transavia
  "jet-prive",                                     // Gulfstream G650
];

const CATEGORY_TILES: { slug: string; label: string; accent: string }[] = [
  { slug: "airbus",   label: "Airbus",   accent: "#3a8eff" },
  { slug: "boeing",   label: "Boeing",   accent: "#d97706" },
  { slug: "concorde", label: "Concorde", accent: "#9333ea" },
  { slug: "jet",      label: "Jet privé", accent: "#a78bfa" },
];

export default function CollectionExplorerV2() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Resolve hero products in declared order; skip missing handles silently.
  const heroes: Product[] = HERO_HANDLES
    .map((h) => PRODUCTS.find((p) => p.handle === h))
    .filter((p): p is Product => Boolean(p));

  // Count products per category for the category tiles.
  const countByCollection = (slug: string) =>
    PRODUCTS.filter((p) => p.collection === slug).length;

  // Scroll progress bar — updates as the user scrolls the carousel.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Approximate card-width step so arrows jump card-by-card.
    const step = Math.max(320, el.clientWidth * 0.55);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

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

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollByCards(-1)}
              aria-label="Précédent"
              className="h-11 w-11 grid place-items-center transition hover:scale-110"
              style={{
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Suivant"
              className="h-11 w-11 grid place-items-center transition hover:scale-110"
              style={{
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── CAROUSEL ── */}
      <div
        ref={scrollerRef}
        className="overflow-x-auto pb-6 px-6 md:px-12 xl:px-20"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex gap-5 md:gap-6">
          {heroes.map((p, idx) => (
            <HeroCard key={p.id} product={p} index={idx + 1} total={heroes.length} />
          ))}
          {/* Spacer so the last card can scroll fully into view */}
          <div aria-hidden style={{ minWidth: "10vw" }} />
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 mt-2">
        <div
          className="relative h-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-100"
            style={{
              width: `${Math.max(8, progress * 100)}%`,
              background: "linear-gradient(90deg, rgba(58,142,255,0.85) 0%, rgba(120,180,255,1) 100%)",
              boxShadow: "0 0 10px rgba(58,142,255,0.4)",
            }}
          />
        </div>
      </div>

      {/* ── CATEGORY TILES ── */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 mt-14 md:mt-20">
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

/* ── HeroCard — XL editorial card ───────────────────────────────────────── */

function HeroCard({ product, index, total }: { product: Product; index: number; total: number }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group shrink-0 relative overflow-hidden"
      style={{
        scrollSnapAlign: "start",
        width: "clamp(280px, 42vw, 520px)",
        aspectRatio: "3/4",
        borderRadius: 20,
        background: "linear-gradient(160deg,#0c0c1c 0%,#06060f 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Index counter — top-left */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="font-mono uppercase"
          style={{
            fontSize: "0.58rem",
            letterSpacing: "0.24em",
            color: "rgba(255,255,255,0.45)",
            padding: "0.35rem 0.7rem",
            borderRadius: 999,
            background: "rgba(8,8,20,0.6)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
          }}
        >
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Bestseller / promo badge — top-right */}
      {product.compareAt && (
        <div
          className="absolute top-4 right-4 z-10 px-2 py-0.5 text-[0.7rem] font-black"
          style={{ borderRadius: 6, background: "#fff", color: "#010108" }}
        >
          −{Math.round(100 - (product.price / product.compareAt) * 100)}%
        </div>
      )}

      {/* Image — full bleed with subtle Ken-Burns on hover */}
      <div className="absolute inset-0">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 42vw, 86vw"
          quality={92}
          className="object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          style={{ padding: "8%" }}
        />
      </div>

      {/* Bottom gradient + meta */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(3,3,8,0.92) 0%, rgba(3,3,8,0.55) 45%, transparent 100%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
        <p
          className="font-mono uppercase mb-2"
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.24em",
            color: "rgba(120,180,255,0.85)",
          }}
        >
          {product.collection}{product.scale ? ` · ${product.scale}` : ""}
        </p>

        <h3
          className="font-bold text-white mb-2 leading-tight"
          style={{ fontSize: "clamp(1.05rem, 2vw, 1.4rem)", letterSpacing: "-0.015em" }}
        >
          {product.title}
        </h3>

        <div className="flex items-baseline justify-between gap-3">
          <span
            className="font-black text-white"
            style={{ fontSize: "1.15rem", letterSpacing: "-0.02em" }}
          >
            {formatPrice(product.price)}
          </span>

          <span
            className="font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              fontSize: "0.58rem",
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Découvrir →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── CategoryTile — big collection card ─────────────────────────────────── */

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
      {/* Faint giant label in the bg */}
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
          {count} modèles
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
