"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";
import {
  PRODUCTS,
  COLLECTIONS,
  sortForDisplay,
  type Collection,
} from "@/lib/products";

gsap.registerPlugin(ScrollTrigger);

/**
 * CollectionExplorer — full inline catalogue, browsable from the home page.
 *
 * Sits right below <BestSellers /> (which now only shows 3 hand-picked
 * gold-framed bestsellers). This component lets visitors scroll the whole
 * fleet without ever leaving the homepage, filtered by category chips:
 *
 *   Tout · Airbus · Boeing · Concorde · Aviation militaire · Jet privé · Packs
 *
 * Accessoires are intentionally excluded from the home explorer to keep the
 * focus on actual aircraft models — accessories still live on /collections.
 */

type FilterKey = "all" | Collection;

// Order the chips the way they should appear on screen.
// `all` first, then the user-facing categories. Accessoires is omitted.
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "Tout"               },
  ...COLLECTIONS
    .filter((c) => c.slug !== "accessoires")
    .map((c) => ({ key: c.slug as FilterKey, label: c.label })),
];

export default function CollectionExplorer() {
  const [active, setActive]   = useState<FilterKey>("all");
  const sectionRef            = useRef<HTMLElement>(null);
  const headingRef            = useRef<HTMLDivElement>(null);
  const gridRef               = useRef<HTMLDivElement>(null);

  // All products visible in the home explorer: everything except accessoires.
  // Out-of-stock items are kept so visitors can see the "Bientôt disponible"
  // overlay and signal interest.
  const visibleProducts = useMemo(
    () =>
      sortForDisplay(
        PRODUCTS.filter((p) => p.collection !== "accessoires"),
      ),
    [],
  );

  // Apply the active filter.
  const filtered = useMemo(() => {
    if (active === "all") return visibleProducts;
    return visibleProducts.filter((p) => p.collection === active);
  }, [active, visibleProducts]);

  // Heading + grid entry animation. We re-fire a soft fade on the cards each
  // time the filter changes so the swap feels intentional, not jumpy.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(headingRef.current, { opacity: 0, y: 40, filter: "blur(6px)" });
        gsap.to(headingRef.current, {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 1, ease: "expo.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(headingRef.current, { opacity: 1, y: 0, filter: "none" });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Soft re-animation of the grid on filter change.
  useEffect(() => {
    if (!gridRef.current) return;
    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const cards = gridRef.current.querySelectorAll<HTMLElement>(
      ".explorer-card",
    );
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.55, ease: "expo.out",
        stagger: 0.04,
        overwrite: "auto",
      },
    );
  }, [active]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #010108 0%, #06060f 8%, #06060f 92%, #010108 100%)",
      }}
    >
      {/* Soft top divider */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(58,142,255,0.18), transparent)",
        }}
      />

      {/* Background grid hint */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(58,142,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.018) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative px-6 md:px-12 pt-20 md:pt-28 pb-24">
        {/* Heading */}
        <div ref={headingRef} className="mb-10 md:mb-12">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-5">
            <div
              aria-hidden
              style={{
                width: 40,
                height: 1,
                background: "rgba(58,142,255,0.6)",
              }}
            />
            <span
              className="font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              style={{ color: "rgba(58,142,255,0.65)" }}
            >
              Collection complète · {filtered.length} modèles
            </span>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-6">
            <h2
              className="font-black text-white leading-[0.88]"
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 4.8rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Toute la flotte.
            </h2>

            <p
              className="text-[0.86rem] leading-relaxed"
              style={{ color: "#565870", maxWidth: 360 }}
            >
              Filtre par marque ou catégorie. Tout est ici — Airbus, Boeing, Concorde, jets privés, packs.
            </p>
          </div>
        </div>

        {/* Filter chips — horizontally scrollable on mobile */}
        <div
          className="-mx-6 md:mx-0 mb-10 md:mb-12 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>

          <div className="flex items-center gap-2.5 px-6 md:px-0 min-w-max md:min-w-0 md:flex-wrap">
            {FILTERS.map((f) => {
              const isActive = active === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActive(f.key)}
                  className="font-mono text-[0.66rem] tracking-[0.22em] uppercase transition-all duration-200 whitespace-nowrap"
                  style={{
                    padding: "0.62rem 1.15rem",
                    borderRadius: 999,
                    background: isActive
                      ? "linear-gradient(135deg, rgba(58,142,255,0.22), rgba(58,142,255,0.08))"
                      : "rgba(255,255,255,0.03)",
                    border: isActive
                      ? "1px solid rgba(120,180,255,0.55)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: isActive
                      ? "#ffffff"
                      : "rgba(255,255,255,0.55)",
                    boxShadow: isActive
                      ? "0 0 24px rgba(58,142,255,0.18), inset 0 0 12px rgba(58,142,255,0.08)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (isActive) return;
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.06)";
                    el.style.borderColor = "rgba(255,255,255,0.16)";
                    el.style.color = "rgba(255,255,255,0.85)";
                  }}
                  onMouseLeave={(e) => {
                    if (isActive) return;
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.03)";
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.color = "rgba(255,255,255,0.55)";
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {filtered.map((p) => (
            <div key={p.id} className="explorer-card">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Empty state — should never trigger with current data, but defensive */}
        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p
              className="font-mono text-[0.7rem] tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Aucun modèle dans cette catégorie pour l&apos;instant.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
