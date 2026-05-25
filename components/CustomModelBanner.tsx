"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * CustomModelBanner — compact CTA banner placed ABOVE the bestseller grid.
 *
 * Purpose: invite visitors to commission a fully bespoke model (their choice
 * of aircraft, livery, tail number, gravure). Kept intentionally lean — one
 * row on desktop, stacked on mobile — so it teases without competing with the
 * full PersonalizationSection that lives further down the page.
 */
export default function CustomModelBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const inner      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(inner.current, { opacity: 0, y: 30, filter: "blur(6px)" });
        gsap.to(inner.current, {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 1.1, ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(inner.current, { opacity: 1, y: 0, filter: "none" });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "#010108" }}
    >
      {/* Top + bottom rim for separation */}
      <div aria-hidden className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(200,160,40,0.25), transparent)" }} />
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(200,160,40,0.18), transparent)" }} />

      {/* Soft warm gold radial */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 90% at 50% 50%, rgba(200,160,40,0.06), transparent 75%)",
        }} />

      <div
        ref={inner}
        className="relative mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12"
      >
        {/* ── LEFT — Icon block ── */}
        <div className="shrink-0 flex items-center gap-5">
          {/* SVG icon: blueprint plane with pencil */}
          <div
            className="flex items-center justify-center"
            style={{
              width: 72,
              height: 72,
              borderRadius: "1.2rem",
              background: "linear-gradient(145deg, #0e0e1a, #050510)",
              border: "1px solid rgba(200,160,40,0.18)",
              boxShadow: "0 0 32px rgba(200,160,40,0.08), inset 0 0 18px rgba(0,0,0,0.5)",
            }}
            aria-hidden
          >
            <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
              {/* Blueprint grid */}
              <rect x="3" y="3" width="34" height="34" rx="2.5"
                fill="none" stroke="rgba(200,160,40,0.15)" strokeWidth="0.5" />
              <line x1="3" y1="13" x2="37" y2="13" stroke="rgba(200,160,40,0.10)" strokeWidth="0.4" />
              <line x1="3" y1="27" x2="37" y2="27" stroke="rgba(200,160,40,0.10)" strokeWidth="0.4" />
              <line x1="13" y1="3" x2="13" y2="37" stroke="rgba(200,160,40,0.10)" strokeWidth="0.4" />
              <line x1="27" y1="3" x2="27" y2="37" stroke="rgba(200,160,40,0.10)" strokeWidth="0.4" />

              {/* Plane silhouette */}
              <path
                d="M9 22 L18 17 L28 16 L31 19 L24 20 L20 24 L17 24 L18 21 L13 23 Z"
                fill="rgba(232,192,72,0.92)"
              />
              {/* Tail */}
              <path d="M9 22 L12 18 L15 20 L13 24 Z" fill="rgba(232,192,72,0.65)" />

              {/* Pencil arrow accent */}
              <path
                d="M28 30 L34 30"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M32 28 L34 30 L32 32"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Eyebrow + lockup label visible on mobile only */}
          <div className="lg:hidden">
            <span
              className="font-mono text-[0.6rem] tracking-[0.28em] uppercase"
              style={{ color: "rgba(200,160,40,0.75)" }}
            >
              ★ Sur mesure
            </span>
          </div>
        </div>

        {/* ── MIDDLE — Copy block ── */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow (desktop) */}
          <div className="hidden lg:flex items-center gap-3 mb-3">
            <div style={{ width: 18, height: 1, background: "rgba(200,160,40,0.55)" }} />
            <span
              className="font-mono text-[0.6rem] tracking-[0.28em] uppercase"
              style={{ color: "rgba(200,160,40,0.75)" }}
            >
              ★ Sur mesure · Édition unique
            </span>
          </div>

          <h2
            className="font-black leading-[1.05] tracking-tight mb-3"
            style={{
              fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)",
              letterSpacing: "-0.025em",
            }}
          >
            <span style={{
              background: "linear-gradient(120deg, #f5ecdb 0%, #ffffff 50%, #d8cfbe 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Votre avion, votre livrée —
            </span>
            {" "}
            <span style={{ color: "rgba(232,192,72,1)" }}>
              fait pour vous.
            </span>
          </h2>

          <p
            className="text-[0.93rem] md:text-[0.98rem] leading-[1.65]"
            style={{ color: "rgba(255,255,255,0.55)", maxWidth: 620 }}
          >
            On crée votre maquette sur mesure — modèle d&apos;avion de votre choix,
            livrée personnalisée (compagnie, sponsor, immatriculation, photo de
            référence). Gravure incluse, devis sous 24 h.
          </p>
        </div>

        {/* ── RIGHT — CTA block ── */}
        <div className="shrink-0 w-full lg:w-auto flex flex-col items-start lg:items-end gap-3">
          <Link
            href="/contact?subject=maquette-personnalisee"
            className="inline-flex items-center gap-2 font-bold text-[0.88rem] px-7 py-3.5 rounded-full transition-all duration-300 whitespace-nowrap"
            style={{
              background: "linear-gradient(125deg, #c8a028 0%, #e8c048 50%, #b88820 100%)",
              color: "#06060f",
              boxShadow: "0 0 28px rgba(200,160,40,0.22)",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.boxShadow = "0 0 44px rgba(200,160,40,0.4)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.boxShadow = "0 0 28px rgba(200,160,40,0.22)";
              el.style.transform = "translateY(0)";
            }}
          >
            Demander un devis <span aria-hidden>→</span>
          </Link>
          <p
            className="font-mono text-[0.58rem] tracking-[0.22em] uppercase"
            style={{ color: "rgba(255,255,255,0.32)" }}
          >
            Sans engagement · Réponse 24 h
          </p>
        </div>
      </div>
    </section>
  );
}
