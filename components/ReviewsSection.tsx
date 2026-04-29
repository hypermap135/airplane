"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURED_REVIEW = {
  name: "Capitaine Thomas R.",
  role: "47 ans — commandant de bord Air France",
  product: "Airbus A380 Air France",
  body: "Une sculpture. On ne dit pas maquette, on dit sculpture. Le niveau de détail m'a laissé sans voix quand j'ai ouvert la boîte — je m'attendais à un jouet, j'ai reçu une œuvre.",
  stars: 5,
};

const REVIEWS = [
  {
    name: "Marc D.",
    role: "Commandant de bord (retraité)",
    product: "Airbus A380 Air France",
    body: "Je collectionne les maquettes depuis 30 ans. Jamais vu une telle qualité à ce prix. Le fuselage est impeccable, les couleurs fidèles à la livrée.",
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
    body: "La qualité est bluffante. Le socle en bois, les finitions, tout est pensé. J'ai commandé le Concorde et je compte en commander d'autres.",
    stars: 5,
    date: "Janvier 2025",
  },
  {
    name: "Isabelle R.",
    role: "Cliente fidèle",
    product: "Pack Prestige Air France",
    body: "Deuxième commande. Livraison parfaite, emballage premium, maquettes magnifiques. J'ai offert le pack à mon mari pilote. Il est impressionné par le niveau de détail.",
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
    body: "Livraison soignée, emballage premium. On voit que c'est fait avec passion. La peinture est parfaite, le socle bois massif finit l'ensemble.",
    stars: 5,
    date: "Avril 2025",
  },
  {
    name: "Camille B.",
    role: "Acheteuse surprise",
    product: "Airbus A320 Neo",
    body: "J'ai failli ne pas commander — et c'est la meilleure décision que j'aie prise. Chaque détail est d'une précision remarquable. C'est devenu la pièce maîtresse de mon bureau.",
    stars: 5,
    date: "Mai 2025",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "1rem", lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const sectionRef    = useRef<HTMLElement>(null);
  const headingRef    = useRef<HTMLDivElement>(null);
  const featuredRef   = useRef<HTMLDivElement>(null);
  const scrollRowRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Heading */
        gsap.set(headingRef.current, { opacity: 0, y: 60, filter: "blur(8px)" });
        gsap.to(headingRef.current, {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        });

        /* Featured review: slides in from left */
        gsap.set(featuredRef.current, { opacity: 0, x: -80, filter: "blur(6px)" });
        gsap.to(featuredRef.current, {
          opacity: 1, x: 0, filter: "blur(0px)",
          duration: 1.3, ease: "expo.out",
          scrollTrigger: { trigger: featuredRef.current, start: "top 82%" },
        });

        /* Small cards stagger in */
        gsap.utils.toArray<HTMLElement>(".rs-card").forEach((card, i) => {
          gsap.set(card, { opacity: 0, y: 50, scale: 0.95 });
          gsap.to(card, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.85, ease: "expo.out",
            delay: i * 0.07,
            scrollTrigger: { trigger: scrollRowRef.current, start: "top 88%", toggleActions: "play none none none" },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [headingRef.current, featuredRef.current, ".rs-card"],
          { opacity: 1, y: 0, x: 0, scale: 1, filter: "none" }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 md:py-40"
      style={{ background: "#06060f" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(18,50,160,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">

        {/* ── Heading ── */}
        <div ref={headingRef} className="mb-16 md:mb-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div style={{ width: 32, height: 1, background: "rgba(58,142,255,0.5)" }} />
            <span
              className="font-mono text-[0.62rem] tracking-[0.3em] uppercase"
              style={{ color: "rgba(58,142,255,0.6)" }}
            >
              Avis clients vérifiés
            </span>
            <div style={{ width: 32, height: 1, background: "rgba(58,142,255,0.5)" }} />
          </div>

          <h2
            className="font-black text-white leading-[0.92] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", letterSpacing: "-0.03em" }}
          >
            Ils ont choisi
            <br />
            la collection.
          </h2>
        </div>

        {/* ── Featured review ── */}
        <div
          ref={featuredRef}
          className="relative mb-16 md:mb-20 mx-auto"
          style={{ maxWidth: 860 }}
        >
          {/* Decorative large quote mark */}
          <div
            aria-hidden
            className="font-black leading-none select-none"
            style={{
              fontSize: "clamp(5rem, 8vw, 9rem)",
              color: "rgba(58,142,255,0.12)",
              lineHeight: 0.8,
              marginBottom: "-0.1em",
            }}
          >
            &ldquo;
          </div>

          <blockquote
            className="font-black italic text-white leading-[1.35]"
            style={{
              fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {FEATURED_REVIEW.body}
          </blockquote>

          {/* Author row */}
          <div
            className="flex flex-wrap items-center gap-5 mt-8 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Stars count={FEATURED_REVIEW.stars} />
            <div>
              <div className="font-bold text-white text-[0.95rem]">{FEATURED_REVIEW.name}</div>
              <div
                className="font-mono text-[0.6rem] tracking-[0.18em] uppercase mt-0.5"
                style={{ color: "rgba(58,142,255,0.55)" }}
              >
                {FEATURED_REVIEW.role}
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 ml-auto"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <span style={{ fontSize: "0.55rem", color: "rgba(58,142,255,0.4)" }}>✦</span>
              <span
                className="font-mono text-[0.58rem] tracking-[0.1em]"
                style={{ color: "rgba(58,142,255,0.45)" }}
              >
                {FEATURED_REVIEW.product}
              </span>
            </div>
          </div>
        </div>

        {/* ── Horizontal scroll row ── */}
        <div
          ref={scrollRowRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style>{`.rs-scroll-row::-webkit-scrollbar{display:none}`}</style>
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="rs-card flex-none flex flex-col gap-4"
              style={{
                width: "clamp(260px, 30vw, 320px)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "1.25rem",
                padding: "1.5rem",
              }}
            >
              {/* Decorative quote + stars */}
              <div className="flex items-start justify-between gap-2">
                <div
                  aria-hidden
                  className="font-black leading-none select-none"
                  style={{
                    fontSize: "clamp(5rem, 8vw, 9rem)",
                    color: "rgba(58,142,255,0.12)",
                    lineHeight: 0.7,
                    marginTop: "-0.2em",
                    marginLeft: "-0.05em",
                    flexShrink: 0,
                  }}
                >
                  &ldquo;
                </div>
                <div className="flex flex-col items-end gap-1 pt-1">
                  <Stars count={r.stars} />
                  <span
                    className="font-mono text-[0.55rem] tracking-[0.12em] uppercase"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    {r.date}
                  </span>
                </div>
              </div>

              {/* Body */}
              <p
                className="text-[0.84rem] leading-[1.8] flex-1"
                style={{ color: "rgba(255,255,255,0.68)" }}
              >
                {r.body}
              </p>

              {/* Author */}
              <div
                className="pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="font-bold text-white text-[0.82rem]">{r.name}</div>
                <div
                  className="font-mono text-[0.58rem] tracking-[0.12em] uppercase mt-0.5"
                  style={{ color: "rgba(58,142,255,0.45)" }}
                >
                  {r.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom caption */}
        <div className="mt-10 text-center">
          <p
            className="font-mono text-[0.6rem] tracking-[0.22em] uppercase"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            Avis collectés sur Shopify · Acheteurs vérifiés
          </p>
        </div>
      </div>
    </section>
  );
}
