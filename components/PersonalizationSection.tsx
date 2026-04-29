"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PersonalizationSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const illustRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(illustRef.current, { opacity: 0, x: -48, filter: "blur(12px)" });
        gsap.to(illustRef.current, {
          opacity: 1, x: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        });

        gsap.set(textRef.current, { opacity: 0, x: 48, filter: "blur(12px)" });
        gsap.to(textRef.current, {
          opacity: 1, x: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([illustRef.current, textRef.current], { opacity: 1, x: 0, filter: "none" });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-36"
      style={{
        background: "#06060f",
      }}
    >
      {/* Warm gold glow from bottom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(180,140,40,0.12), transparent)",
        }}
      />
      {/* Subtle top rim */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 grid gap-16 lg:grid-cols-[55%_45%] items-center">

        {/* ── LEFT: SVG Illustration ── */}
        <div
          ref={illustRef}
          className="flex items-center justify-center"
          style={{ minHeight: 380 }}
        >
          <div
            className="relative"
            style={{
              width: "min(420px, 100%)",
              aspectRatio: "1 / 1",
              borderRadius: "1.75rem",
              background: "linear-gradient(145deg, #0d0d1a 0%, #080810 100%)",
              border: "1px solid rgba(200,160,40,0.10)",
              boxShadow: "0 0 80px rgba(180,140,40,0.06), inset 0 0 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Corner filigree dots */}
            {[
              { top: 14, left:  14 },
              { top: 14, right: 14 },
              { bottom: 14, left:  14 },
              { bottom: 14, right: 14 },
            ].map((pos, i) => (
              <div
                key={i}
                aria-hidden
                className="absolute w-1 h-1 rounded-full"
                style={{ ...pos, background: "rgba(200,160,40,0.35)" }}
              />
            ))}

            <svg
              viewBox="0 0 200 200"
              className="w-full h-full p-8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Maquette avec gravure cadeau"
            >
              {/* ── Gift ribbon horizontal ── */}
              <line
                x1="20" y1="100" x2="180" y2="100"
                stroke="rgba(200,160,40,0.45)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              {/* ── Gift ribbon vertical ── */}
              <line
                x1="100" y1="20" x2="100" y2="180"
                stroke="rgba(200,160,40,0.45)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* ── Bow — left loop ── */}
              <path
                d="M100 72 Q78 50 72 66 Q78 82 100 72"
                fill="none"
                stroke="rgba(200,160,40,0.75)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* ── Bow — right loop ── */}
              <path
                d="M100 72 Q122 50 128 66 Q122 82 100 72"
                fill="none"
                stroke="rgba(200,160,40,0.75)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* ── Bow — centre knot ── */}
              <circle
                cx="100" cy="72" r="3.5"
                fill="rgba(200,160,40,0.55)"
                stroke="rgba(200,160,40,0.9)"
                strokeWidth="1"
              />

              {/* ── Plane silhouette ── */}
              {/* Fuselage */}
              <path
                d="M52 112 L90 88 L150 84 L156 96 L128 100 L118 112 Z"
                fill="rgba(255,255,255,0.92)"
              />
              {/* Wing */}
              <path
                d="M110 112 L118 112 L128 100 L105 103 Z"
                fill="rgba(255,255,255,0.55)"
              />
              {/* Tail fin */}
              <path
                d="M52 112 L66 96 L80 100 L72 112 Z"
                fill="rgba(255,255,255,0.65)"
              />
              {/* Engine pod */}
              <ellipse
                cx="130" cy="102" rx="10" ry="5"
                fill="rgba(255,255,255,0.30)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
              />
              {/* Cockpit window */}
              <ellipse
                cx="148" cy="90" rx="5" ry="4"
                fill="rgba(58,142,255,0.55)"
                stroke="rgba(58,142,255,0.3)"
                strokeWidth="0.5"
              />
              {/* LED glow under cockpit */}
              <ellipse
                cx="148" cy="91" rx="7" ry="5"
                fill="rgba(58,142,255,0.08)"
              />

              {/* ── Socle (base) ── */}
              <rect
                x="76" y="128" width="84" height="10" rx="2"
                fill="rgba(255,255,255,0.08)"
                stroke="rgba(200,160,40,0.25)"
                strokeWidth="0.75"
              />
              {/* Engraving line on socle */}
              <rect x="84" y="131" width="48" height="1.5" rx="0.75"
                fill="rgba(200,160,40,0.50)" />
              <rect x="84" y="134.5" width="32" height="1" rx="0.5"
                fill="rgba(200,160,40,0.25)" />

              {/* ── Price tag ── */}
              <rect
                x="140" y="122" width="34" height="18" rx="4"
                fill="rgba(200,160,40,0.12)"
                stroke="rgba(200,160,40,0.35)"
                strokeWidth="0.75"
              />
              <circle cx="144" cy="126" r="1.5" fill="none"
                stroke="rgba(200,160,40,0.6)" strokeWidth="0.75" />
              <line x1="144" y1="124.5" x2="144" y2="122"
                stroke="rgba(200,160,40,0.4)" strokeWidth="0.75" />

              {/* ── Stars in top-left quadrant ── */}
              {[
                { cx: 38, cy: 44 },
                { cx: 55, cy: 30 },
                { cx: 30, cy: 62 },
              ].map((s, i) => (
                <circle key={i} cx={s.cx} cy={s.cy} r={1}
                  fill={`rgba(200,160,40,${0.3 + i * 0.15})`} />
              ))}
            </svg>

            {/* Label badge */}
            <div
              className="absolute bottom-5 left-0 right-0 flex justify-center"
            >
              <span
                className="font-mono text-[0.58rem] tracking-[0.22em] uppercase px-3 py-1"
                style={{
                  color: "rgba(200,160,40,0.7)",
                  background: "rgba(200,160,40,0.06)",
                  border: "1px solid rgba(200,160,40,0.15)",
                  borderRadius: "999px",
                }}
              >
                Gravure laser · Socle bois
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Text content ── */}
        <div ref={textRef}>
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7">
            <div style={{ width: 20, height: 1, background: "rgba(200,160,40,0.6)" }} />
            <span
              className="font-mono text-[0.62rem] tracking-[0.28em] uppercase"
              style={{ color: "rgba(200,160,40,0.7)" }}
            >
              Gravure personnalisée · +15€
            </span>
          </div>

          {/* Heading */}
          <h2
            className="font-black leading-[1.05] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.2rem,4vw,4rem)", letterSpacing: "-0.025em" }}
          >
            <span style={{
              background: "linear-gradient(120deg, #e8ddd0 0%, #ffffff 50%, #c8c0b4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Offrir une maquette, c&apos;est bien. Offrir votre nom dessus —
            </span>
            {" "}
            <span style={{ color: "rgba(210,165,40,1)" }}>
              c&apos;est inoubliable.
            </span>
          </h2>

          {/* Body */}
          <p
            className="text-[1rem] leading-[1.8] mb-10"
            style={{ color: "rgba(255,255,255,0.42)", maxWidth: 400 }}
          >
            Prénom, date de naissance, immatriculation, message. Gravé au laser
            sur le socle. Une pièce unique.
          </p>

          {/* CTA */}
          <Link
            href="/products/gravure-personnalisee"
            className="inline-flex items-center gap-2 font-bold text-[0.92rem] px-7 py-3.5 rounded-full transition-all duration-300"
            style={{
              background: "linear-gradient(125deg, #c8a028 0%, #e8c048 50%, #b88820 100%)",
              color: "#06060f",
              boxShadow: "0 0 32px rgba(200,160,40,0.25)",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 48px rgba(200,160,40,0.45)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 32px rgba(200,160,40,0.25)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Ajouter une gravure <span aria-hidden>→</span>
          </Link>

          {/* Trust line */}
          <p
            className="mt-6 text-[0.72rem] tracking-[0.06em]"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            🎁 Emballage cadeau&ensp;·&ensp;Livraison sécurisée&ensp;·&ensp;Certificat d&apos;authenticité
          </p>
        </div>
      </div>
    </section>
  );
}
