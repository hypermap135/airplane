"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FAQ from "./FAQ";

gsap.registerPlugin(ScrollTrigger);

const TRUST_ITEMS = [
  { icon: "🚚", label: "Livraison offerte dès 100€" },
  { icon: "🔄", label: "Retour 30j" },
  { icon: "⭐", label: "4.9/5 · +2000 clients" },
];

/* Subtle plane silhouette — side profile, generic wide-body */
function PlaneSilhouette() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 400"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        bottom: "8%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(1100px, 92vw)",
        opacity: 0.035,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Fuselage */}
      <ellipse cx="600" cy="200" rx="480" ry="32" />
      {/* Nose cone */}
      <path d="M1080 200 Q1160 200 1180 208 Q1160 216 1080 200Z" />
      {/* Main wings */}
      <path d="M540 200 L700 90 L760 120 L620 200Z" />
      <path d="M540 200 L700 310 L760 280 L620 200Z" />
      {/* Tail fin vertical */}
      <path d="M140 200 L160 110 L190 115 L175 200Z" />
      {/* Tail horizontal stabiliser */}
      <path d="M140 200 L200 155 L220 165 L165 200Z" />
      <path d="M140 200 L200 245 L220 235 L165 200Z" />
      {/* Engine pods */}
      <ellipse cx="660" cy="144" rx="52" ry="13" />
      <ellipse cx="660" cy="256" rx="52" ry="13" />
    </svg>
  );
}

export default function CTASection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const topLineRef  = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLDivElement>(null);
  const faqRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Top gradient line sweeps in */
        gsap.set(topLineRef.current, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(topLineRef.current, {
          scaleX: 1, duration: 1.4, ease: "expo.inOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 88%" },
        });

        /* Main content fades up dramatically */
        const contentEls = contentRef.current
          ? Array.from(contentRef.current.children)
          : [];
        gsap.set(contentEls, { opacity: 0, y: 70, filter: "blur(8px)" });
        gsap.to(contentEls, {
          opacity: 1, y: 0, filter: "blur(0px)",
          stagger: 0.12, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: contentRef.current, start: "top 82%" },
        });

        /* Trust row items */
        gsap.set(".cta-trust-item", { opacity: 0, y: 24, scale: 0.9 });
        gsap.to(".cta-trust-item", {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.1, duration: 0.7, ease: "back.out(1.6)",
          scrollTrigger: { trigger: trustRef.current, start: "top 90%" },
        });

        /* FAQ columns */
        if (faqRef.current?.children[0]) {
          gsap.set(faqRef.current.children[0], { opacity: 0, x: -40 });
          gsap.to(faqRef.current.children[0], {
            opacity: 1, x: 0, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: faqRef.current, start: "top 82%" },
          });
        }
        if (faqRef.current?.children[1]) {
          gsap.set(faqRef.current.children[1], { opacity: 0, x: 40 });
          gsap.to(faqRef.current.children[1], {
            opacity: 1, x: 0, duration: 1, ease: "expo.out", delay: 0.1,
            scrollTrigger: { trigger: faqRef.current, start: "top 82%" },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [topLineRef.current, ".cta-trust-item"],
          { opacity: 1, y: 0, x: 0, scale: 1, scaleX: 1, filter: "none" }
        );
        if (contentRef.current)
          gsap.set(Array.from(contentRef.current.children), { opacity: 1, y: 0, filter: "none" });
        if (faqRef.current)
          gsap.set(Array.from(faqRef.current.children), { opacity: 1, x: 0 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "#06060f" }}
    >
      {/* ── Deep glow at bottom ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(30,80,200,0.28), transparent)",
        }}
      />

      {/* ── Plane silhouette ── */}
      <PlaneSilhouette />

      {/* ── Top gradient accent line ── */}
      <div
        ref={topLineRef}
        style={{
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(58,142,255,0.6) 30%, rgba(58,142,255,0.6) 70%, transparent)",
        }}
      />

      {/* ══════════════════════════════════════
          MAIN CTA BLOCK
      ══════════════════════════════════════ */}
      <div className="relative mx-auto max-w-5xl px-6 md:px-12 pt-28 md:pt-40 pb-24 md:pb-36 text-center">
        <div ref={contentRef} className="flex flex-col items-center gap-0">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.5)" }} />
            <span
              className="font-mono text-[0.62rem] tracking-[0.32em] uppercase"
              style={{ color: "rgba(58,142,255,0.65)" }}
            >
              Votre collection commence ici
            </span>
            <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.5)" }} />
          </div>

          {/* Main heading */}
          <h2
            className="font-black text-white leading-[0.9] tracking-tight mb-8"
            style={{
              fontSize: "clamp(3rem, 7vw, 8rem)",
              letterSpacing: "-0.04em",
            }}
          >
            Prête
            <br />
            à décoller.
          </h2>

          {/* Subtext */}
          <p
            className="text-[1.05rem] leading-[1.75] mb-12"
            style={{ color: "rgba(255,255,255,0.42)", maxWidth: 480 }}
          >
            Chaque passionné commence par une première pièce.
            Livraison France &amp; Europe en 7 à 15 jours.
            30 jours pour changer d&apos;avis.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 font-bold text-[0.95rem] tracking-wide transition-opacity hover:opacity-80 active:opacity-70"
              style={{
                background: "#ffffff",
                color: "#06060f",
                borderRadius: 999,
                padding: "0.875rem 2rem",
              }}
            >
              Explorer la collection →
            </Link>
            <Link
              href="/a-propos"
              className="inline-flex items-center gap-2 font-semibold text-[0.95rem] tracking-wide transition-all hover:bg-white/10 active:bg-white/15"
              style={{
                color: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "0.875rem 2rem",
              }}
            >
              À propos de nous
            </Link>
          </div>

          {/* Trust row */}
          <div ref={trustRef} className="flex flex-wrap items-center justify-center gap-6">
            {TRUST_ITEMS.map((item, i) => (
              <div
                key={i}
                className="cta-trust-item flex items-center gap-2"
              >
                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                <span
                  className="font-mono text-[0.62rem] tracking-[0.14em] uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {item.label}
                </span>
                {i < TRUST_ITEMS.length - 1 && (
                  <span
                    aria-hidden
                    style={{ color: "rgba(255,255,255,0.1)", marginLeft: 8 }}
                  >·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className="mx-auto max-w-7xl px-6 md:px-12"
        style={{
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(58,142,255,0.2) 30%, rgba(58,142,255,0.06) 70%, transparent)",
        }}
      />

      {/* ══════════════════════════════════════
          FAQ BLOCK
      ══════════════════════════════════════ */}
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 py-24 md:py-36">
        <div ref={faqRef} className="grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <div
              className="font-mono text-[0.62rem] tracking-[0.28em] uppercase mb-5"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Questions fréquentes
            </div>
            <h3
              className="font-black leading-[0.9] tracking-tight text-white"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Vos
              <br />
              questions.
            </h3>
          </div>
          <div>
            <FAQ />
          </div>
        </div>
      </div>
    </section>
  );
}
