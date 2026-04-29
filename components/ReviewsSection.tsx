"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  {
    name: "Marc D.",
    role: "Commandant de bord Air France (retraité)",
    product: "Airbus A380 Air France",
    body: "Je collectionne les maquettes depuis 30 ans. Jamais vu une telle qualité à ce prix. Le fuselage est impeccable, les couleurs fidèles à la livrée. L'éclairage LED est un vrai plus.",
    stars: 5,
    date: "Mars 2025",
  },
  {
    name: "Sophie L.",
    role: "Fille de pilote",
    product: "Boeing 777 Air France",
    body: "Cadeau pour l'anniversaire de mon père. Il était en larmes en ouvrant la boîte. L'emballage est soigné, la maquette superbe. Je recommande les yeux fermés.",
    stars: 5,
    date: "Février 2025",
  },
  {
    name: "Alexandre M.",
    role: "Passionné d'aviation",
    product: "Concorde Air France 1/125",
    body: "La qualité est bluffante. Le socle en bois, les finitions, tout est pensé. J'ai commandé le Concorde et je compte en commander d'autres. Livraison rapide, bien emballé.",
    stars: 5,
    date: "Janvier 2025",
  },
  {
    name: "Isabelle R.",
    role: "Cliente fidèle",
    product: "Pack Prestige Air France",
    body: "Deuxième commande sur ce site. Livraison parfaite, emballage premium, maquettes magnifiques. J'ai offert le pack à mon mari pilote. Il est impressionné par le niveau de détail.",
    stars: 5,
    date: "Avril 2025",
  },
  {
    name: "Thomas C.",
    role: "Contrôleur aérien",
    product: "Airbus A350 Air France",
    body: "Je travaille en tour de contrôle depuis 15 ans. Cette maquette trône sur mon bureau depuis le jour de livraison. Mes collègues me demandent tous où je l'ai achetée.",
    stars: 5,
    date: "Mars 2025",
  },
  {
    name: "Jean-Pierre V.",
    role: "Ancien mécanicien navigant",
    product: "Boeing 787 Air France",
    body: "Livraison soignée, emballage premium. On voit que c'est fait avec passion. La peinture est parfaite, le socle bois massif finit l'ensemble. Un cadeau idéal pour un passionné.",
    stars: 5,
    date: "Avril 2025",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.88rem", lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(headingRef.current, { opacity: 0, y: 50, filter: "blur(8px)" });
        gsap.to(headingRef.current, {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        });

        gsap.utils.toArray<HTMLElement>(".review-card").forEach((card, i) => {
          gsap.set(card, { opacity: 0, y: 60, scale: 0.94 });
          gsap.to(card, {
            opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out",
            delay: (i % 3) * 0.1,
            scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none none" },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([headingRef.current, ".review-card"], { opacity: 1, y: 0, scale: 1, filter: "none" });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: "#050510" }}>
      {/* Ambient */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(18,50,160,0.08) 0%, transparent 70%)",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">

        {/* Heading */}
        <div ref={headingRef} className="mb-14 md:mb-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Avis clients vérifiés
            </span>
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
          </div>

          <h2 className="font-black uppercase leading-[0.9] tracking-tight mb-8"
            style={{
              fontSize: "clamp(2.2rem,5vw,4rem)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            Ils ont commandé.<br />Voici leurs mots.
          </h2>

          {/* Global rating pill */}
          <div className="inline-flex items-center gap-3 px-5 py-3"
            style={{
              borderRadius: 999,
              background: "rgba(12,12,26,0.8)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "1.1rem", lineHeight: 1 }}>★</span>
              ))}
            </div>
            <span className="font-black text-white text-[1rem]">4.9</span>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
            <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: "#565870" }}>
              +2 000 avis
            </span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name}
              className="review-card flex flex-col gap-4 p-6 transition-all duration-300"
              style={{
                borderRadius: "1.25rem",
                background: "#0c0c1a",
                border: "1px solid #1c1c2e",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(245,158,11,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.border = "1px solid #1c1c2e";
              }}
            >
              {/* Stars + date */}
              <div className="flex items-center justify-between">
                <Stars count={r.stars} />
                <span className="font-mono text-[0.58rem] tracking-[0.12em] uppercase" style={{ color: "#3a4055" }}>
                  {r.date}
                </span>
              </div>

              {/* Body */}
              <p className="text-[0.86rem] leading-[1.75] flex-1" style={{ color: "rgba(255,255,255,0.72)" }}>
                &ldquo;{r.body}&rdquo;
              </p>

              {/* Author */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.875rem" }}>
                <div className="font-bold text-white text-[0.82rem]">{r.name}</div>
                <div className="font-mono text-[0.58rem] tracking-[0.12em] uppercase mt-0.5" style={{ color: "#3a4055" }}>
                  {r.role}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span style={{ color: "rgba(58,142,255,0.45)", fontSize: "0.6rem" }}>✦</span>
                  <span className="font-mono text-[0.6rem] tracking-[0.1em]" style={{ color: "rgba(58,142,255,0.55)" }}>
                    {r.product}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom summary */}
        <div className="mt-12 text-center">
          <p className="font-mono text-[0.62rem] tracking-[0.2em] uppercase" style={{ color: "#3a4055" }}>
            Avis collectés sur Shopify · Acheteurs vérifiés
          </p>
        </div>
      </div>
    </section>
  );
}
