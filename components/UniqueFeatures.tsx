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
              }}
            >
              {/* Image — contained, never cropped */}
              <div
                className="relative w-full"
                style={{
                  aspectRatio: "4/3",
                  background:
                    "radial-gradient(ellipse 70% 70% at 50% 60%, rgba(58,142,255,0.06) 0%, transparent 70%), #0a0a14",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.image}
                  alt={f.imageAlt}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ padding: "8% 10%" }}
                  loading="lazy"
                />
                {/* subtle bottom fade so the card title pops */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 pointer-events-none"
                  style={{
                    height: "30%",
                    background:
                      "linear-gradient(to top, rgba(7,7,15,0.85) 0%, transparent 100%)",
                  }}
                />
                {/* tiny number chip */}
                <div
                  className="absolute top-4 left-4 font-mono text-[0.55rem] tracking-[0.22em] uppercase px-2 py-1"
                  style={{
                    borderRadius: 999,
                    background: "rgba(8,8,20,0.7)",
                    border: `1px solid ${f.accent}55`,
                    color: f.accent,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {f.num}
                </div>
              </div>

              {/* Text — clean block under the image */}
              <div className="px-6 pt-5 pb-7">
                <h3
                  className="font-black uppercase leading-[1] tracking-tight mb-3"
                  style={{
                    fontSize: "clamp(1.2rem, 1.9vw, 1.5rem)",
                    letterSpacing: "-0.015em",
                    color: "#f0f2f5",
                  }}
                >
                  {f.title}
                </h3>
                <div
                  aria-hidden
                  style={{
                    width: 32,
                    height: 1,
                    background: `linear-gradient(to right, ${f.accent}88, transparent)`,
                    marginBottom: "0.9rem",
                  }}
                />
                <p
                  className="leading-[1.65]"
                  style={{
                    fontSize: "0.92rem",
                    color: "rgba(255,255,255,0.55)",
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
