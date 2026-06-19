"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    num: "01",
    title: "Indestructible.",
    body: "Résine monobloc. 47 cm de présence, dix ans, vingt ans — exactement la même pièce.",
    image: "/images/a320-new-livery-af.png",
    imageAlt: "A320 Air France new livery — résine premium",
    accent: "#3a8eff",
  },
  {
    num: "02",
    title: "Le cockpit s’éveille.",
    body: "Un tap sur le fuselage, un clap des mains. Vingt secondes de show — puis extinction automatique.",
    image: "/images/a380-emirates.png",
    imageAlt: "A380 — éclairage LED intégré",
    accent: "#e8c048",
  },
  {
    num: "03",
    title: "Chaque rivet à sa place.",
    body: "Livrée reproduite au 1/147ᵉ. Peinture main, train amovible, hublots gravés.",
    image:
      "https://cdn.shopify.com/s/files/1/0921/9312/8788/files/Airbus_A350_Air_France_cote_gauche_nobg.png",
    imageAlt: "A350 Air France — détail livrée 1/147ᵉ",
    accent: "#9aa0a8",
  },
];

export default function UniqueFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(headingRef.current, { opacity: 0, y: 50, filter: "blur(8px)" });
        gsap.to(headingRef.current, {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 88%" },
        });

        gsap.utils.toArray<HTMLElement>(".uf-card").forEach((card, i) => {
          gsap.set(card, { opacity: 0, y: 40 });
          gsap.to(card, {
            opacity: 1, y: 0,
            duration: 0.9, ease: "expo.out",
            delay: i * 0.12,
            scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none none" },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([headingRef.current, ".uf-card"], { opacity: 1, y: 0, filter: "none" });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "#06060f",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Heading */}
      <div
        ref={headingRef}
        className="relative pt-24 md:pt-32 pb-12 md:pb-16 text-center px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.5)" }} />
          <span
            className="font-mono text-[0.6rem] tracking-[0.3em] uppercase"
            style={{ color: "rgba(58,142,255,0.65)" }}
          >
            Savoir-faire
          </span>
          <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.5)" }} />
        </div>
        <h2
          className="font-black uppercase leading-[0.9] tracking-tight"
          style={{
            fontSize: "clamp(2.4rem,5.2vw,4.5rem)",
            letterSpacing: "-0.025em",
            background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          L&apos;obsession du détail.
        </h2>
        <p
          className="mx-auto mt-5 text-[0.95rem] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.45)", maxWidth: 480 }}
        >
          Trois engagements, tenus sur chaque modèle livré.
        </p>
      </div>

      {/* Grid of 3 simple cards */}
      <div className="relative mx-auto max-w-7xl px-6 md:px-10 pb-24 md:pb-32">
        <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.num}
              className="uf-card relative overflow-hidden"
              style={{
                borderRadius: "1.4rem",
                background: "linear-gradient(165deg, #0d0d1a 0%, #07070f 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "border-color 0.3s ease, transform 0.3s ease",
                minHeight: "260px",
              }}
            >
              <div className="h-full flex flex-col px-7 md:px-8 pt-7 pb-7">
                {/* Index + accent dot */}
                <div className="flex items-center gap-2 mb-7">
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.26em",
                      padding: "0.3rem 0.65rem",
                      borderRadius: 999,
                      background: "rgba(8,8,20,0.7)",
                      border: `1px solid ${f.accent}55`,
                      color: f.accent,
                    }}
                  >
                    {f.num}
                  </span>
                  <div
                    aria-hidden
                    style={{
                      flex: 1,
                      height: 1,
                      background: `linear-gradient(to right, ${f.accent}55, transparent)`,
                    }}
                  />
                </div>

                <h3
                  className="font-black uppercase leading-[1] tracking-tight mb-4"
                  style={{
                    fontSize: "clamp(1.4rem, 2.4vw, 1.8rem)",
                    letterSpacing: "-0.02em",
                    color: "#f0f2f5",
                  }}
                >
                  {f.title}
                </h3>

                <p
                  className="leading-[1.6]"
                  style={{
                    fontSize: "0.95rem",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {f.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
