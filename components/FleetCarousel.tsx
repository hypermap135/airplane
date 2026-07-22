"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { COLLECTIONS, formatPrice, type Product } from "@/lib/products";

/**
 * FleetCarousel — filterable horizontal scroll of the available fleet.
 *
 * Replaces the "Toute la flotte" grids/cards we tried before. The user
 * wanted to see "a bit more of the collection with filter chips and a
 * light horizontal scroll" — so this is a Netflix-style row of compact
 * thumbnails, filtered by aircraft family with chips above.
 *
 * Compact intentionally — image + title + price, no card chrome, no
 * "+ Panier" button (that lives on the PDP). Click anywhere on the
 * thumb to go to the PDP.
 *
 * Only renders in-stock + non-coming-soon planes.
 */

type FilterKey = "all" | "airbus" | "boeing" | "concorde" | "jet";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "Tout" },
  { key: "airbus",   label: "Airbus" },
  { key: "boeing",   label: "Boeing" },
  { key: "concorde", label: "Concorde" },
  { key: "jet",      label: "Jet privé" },
];

export default function FleetCarousel({ catalogue }: { catalogue: Product[] }) {
  const [active, setActive] = useState<FilterKey>("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const visible: Product[] = useMemo(() => {
    return catalogue
      .filter((p) => p.inStock && !p.comingSoon)
      .filter((p) => {
        if (active === "all") {
          // exclude accessoires + packs from the home overview so the
          // visitor sees actual aircraft models first
          return p.collection !== "accessoires" && p.collection !== "packs";
        }
        return p.collection === active;
      });
  }, [active, catalogue]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    pauseAutoRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pauseAutoRef.current = false;
    }, 3500);
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.6), behavior: "smooth" });
  };

  /* ── Auto-scroll loop ────────────────────────────────────────────────
     Items are duplicated below, so when scrollLeft passes scrollWidth/2
     we snap back to 0 — the user never sees a jump because the second
     half is identical to the first. Pauses on hover, touch, wheel,
     and after the user uses the arrow buttons (3.5s grace). */
  const pauseAutoRef = useRef(false);
  const resumeTimerRef = useRef<number>(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SPEED = 0.4; // px per frame ≈ 24 px/s at 60fps — slow, esthétique
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!pauseAutoRef.current && el.scrollWidth > el.clientWidth + 8) {
        const half = el.scrollWidth / 2;
        let next = el.scrollLeft + SPEED * (dt / 16.67);
        if (next >= half) next -= half;
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      pauseAutoRef.current = true;
      window.clearTimeout(resumeTimerRef.current);
    };
    const resumeSoon = () => {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => {
        pauseAutoRef.current = false;
      }, 2500);
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resumeSoon);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resumeSoon, { passive: true });
    el.addEventListener("wheel", () => { pause(); resumeSoon(); }, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resumeTimerRef.current);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resumeSoon);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resumeSoon);
    };
  }, [active]);

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
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 mb-8 md:mb-10">
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
            ★ Notre flotte
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            className="font-black text-white"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              background: "linear-gradient(180deg,#fff 0%,#cfd6e4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Toute la flotte.
          </h2>

          {/* Paging arrows — desktop only, hidden on touch */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scrollByCards(-1)}
              aria-label="Précédent"
              className="h-10 w-10 grid place-items-center transition hover:scale-110"
              style={{
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Suivant"
              className="h-10 w-10 grid place-items-center transition hover:scale-110"
              style={{
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="flex flex-wrap gap-2 mt-7">
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            return (
              <button
                key={f.key}
                onClick={() => {
                  setActive(f.key);
                  scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                }}
                className="font-mono uppercase transition-all"
                style={{
                  padding: "0.45rem 0.95rem",
                  borderRadius: 999,
                  fontSize: "0.62rem",
                  letterSpacing: "0.2em",
                  fontWeight: isActive ? 700 : 500,
                  background: isActive
                    ? "linear-gradient(135deg,#fff 0%,#e8eaf0 100%)"
                    : "rgba(255,255,255,0.04)",
                  color: isActive ? "#06060f" : "rgba(255,255,255,0.55)",
                  border: isActive
                    ? "1px solid rgba(255,255,255,0.4)"
                    : "1px solid rgba(255,255,255,0.10)",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── HORIZONTAL SCROLLER ── */}
      <div
        ref={scrollerRef}
        className="overflow-x-auto pb-4 px-6 md:px-12 xl:px-20"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
        }}
      >
        {visible.length === 0 ? (
          <div className="text-white/40 text-sm py-12">
            Aucun modèle disponible dans cette catégorie pour l’instant.
          </div>
        ) : (
          <div
            className="grid grid-flow-col gap-x-4 md:gap-x-5 gap-y-8 md:gap-y-10"
            style={{
              gridTemplateRows: "repeat(2, auto)",
              gridAutoColumns: "clamp(180px, 18vw, 240px)",
            }}
          >
            {/* Items rendered twice for seamless auto-scroll loop.
                The auto-scroll effect snaps back to 0 once scrollLeft
                reaches scrollWidth/2 — second half is a perfect clone
                of the first so the jump is invisible. */}
            {visible.map((p, i) => (
              <FleetThumb key={`a-${p.id}-${i}`} product={p} />
            ))}
            {visible.map((p, i) => (
              <FleetThumb key={`b-${p.id}-${i}`} product={p} ariaHidden />
            ))}
          </div>
        )}
      </div>

      {/* ── "Voir toute la collection" link ── */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 mt-6">
        <Link
          href="/collections/all"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-100"
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
          }}
        >
          Voir toute la collection →
        </Link>
      </div>
    </section>
  );
}

/* ── FleetThumb — compact, no card chrome ──────────────────────────────── */

function FleetThumb({ product, ariaHidden = false }: { product: Product; ariaHidden?: boolean }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group shrink-0"
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
      style={{
        scrollSnapAlign: "start",
        width: "clamp(180px, 18vw, 240px)",
      }}
    >
      <div
        className="relative w-full overflow-hidden mb-3"
        style={{
          aspectRatio: "1/1",
          borderRadius: 12,
          background: "linear-gradient(145deg,#0c0c1c,#06060f)",
          border: "1px solid rgba(255,255,255,0.05)",
          transition: "border-color 0.25s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(58,142,255,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
        }}
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 768px) 20vw, 50vw"
          quality={88}
          className="object-contain transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ padding: "10%" }}
        />
      </div>

      <p
        className="font-mono uppercase mb-1"
        style={{
          fontSize: "0.5rem",
          letterSpacing: "0.22em",
          color: "rgba(120,180,255,0.65)",
        }}
      >
        {product.collection}{product.scale ? ` · ${product.scale}` : ""}
      </p>

      <h3
        className="font-bold text-white leading-tight mb-1 truncate"
        style={{ fontSize: "0.85rem", letterSpacing: "-0.01em" }}
      >
        {product.title}
      </h3>

      <p
        className="font-mono text-white/65"
        style={{ fontSize: "0.78rem", letterSpacing: "-0.01em" }}
      >
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}
