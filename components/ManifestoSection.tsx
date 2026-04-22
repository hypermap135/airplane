"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const QUOTE = "Chaque pièce mérite la même attention qu'un vrai avion.";
const WORDS  = QUOTE.split(" ");

const PILLARS = [
  { hud: "MAT", label: "Résine monobloc" },
  { hud: "FIN", label: "Peinture main" },
  { hud: "LED", label: "Éclairage intégré" },
  { hud: "SCL", label: "Échelle 1/147" },
  { hud: "SVC", label: "Retour 30 jours" },
];

export default function ManifestoSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const quoteRef    = useRef<HTMLQuoteElement>(null);
  const dividerRef  = useRef<HTMLDivElement>(null);
  const pillarsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Set initial states in JS — not in JSX */
        gsap.set(eyebrowRef.current, { opacity: 0, y: 30, filter: "blur(8px)" });
        gsap.set(".manifesto-word", { opacity: 0.04, filter: "blur(8px)", y: 28 });
        gsap.set(dividerRef.current, { scaleX: 0, opacity: 0 });
        gsap.set(".manifesto-pill", { opacity: 0, y: 36, scale: 0.75 });

        gsap.to(eyebrowRef.current,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 82%" } }
        );

        const words = quoteRef.current?.querySelectorAll(".manifesto-word") ?? [];
        gsap.to(words, {
          opacity: 1, filter: "blur(0px)", y: 0,
          stagger: 0.07,
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 78%",
            end: "bottom 28%",
            scrub: 1.2,
          },
        });

        gsap.to(dividerRef.current,
          { scaleX: 1, opacity: 1, duration: 1.6, ease: "expo.inOut",
            scrollTrigger: { trigger: dividerRef.current, start: "top 88%" } }
        );

        gsap.to(".manifesto-pill", {
          opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
          stagger: 0.08, duration: 0.75, ease: "back.out(2)",
          scrollTrigger: { trigger: pillarsRef.current, start: "top 88%" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 md:py-44 overflow-hidden" style={{ background: "#010108" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.5,
      }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 55%, rgba(18,50,160,0.1) 0%, transparent 65%)",
      }} />

      <div className="relative mx-auto max-w-5xl px-6 md:px-8 text-center">
        <div ref={eyebrowRef} className="flex items-center justify-center gap-3 mb-12">
          <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.5)" }} />
          <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.5)" }}>
            Notre philosophie
          </span>
          <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.5)" }} />
        </div>

        <blockquote ref={quoteRef}
          className="font-black uppercase leading-[1.05]"
          style={{ fontSize: "clamp(2rem,5.5vw,4.2rem)", letterSpacing: "-0.01em" }}>
          {WORDS.map((word, i) => (
            <span key={i} className="manifesto-word inline-block"
              style={{
                marginRight: "0.28em",
                background: "linear-gradient(135deg, #ffffff 0%, #c0c8d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              {word}
            </span>
          ))}
        </blockquote>

        <div className="mt-8 font-mono text-[0.65rem] tracking-[0.2em] uppercase" style={{ color: "#3a4055" }}>
          — L&apos;équipe AirplaneStore
        </div>

        <div ref={dividerRef} className="mt-14 mb-12 origin-center" style={{
          height: 1,
          background: "linear-gradient(to right, transparent, rgba(58,142,255,0.5) 50%, transparent)",
          boxShadow: "0 0 12px rgba(58,142,255,0.3)",
        }} />

        <div ref={pillarsRef} className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {PILLARS.map((p) => (
            <div key={p.hud}
              className="manifesto-pill flex items-center gap-2.5 px-4 py-2.5"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(58,142,255,0.2)",
                background: "rgba(12,12,26,0.8)",
                backdropFilter: "blur(12px)",
              }}>
              <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
                {p.hud}
              </span>
              <span className="text-[0.78rem] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
