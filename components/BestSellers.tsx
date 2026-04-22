"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";
import { PRODUCTS } from "@/lib/products";

gsap.registerPlugin(ScrollTrigger);

export default function BestSellers() {
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  const products = PRODUCTS.filter((p) => p.inStock).slice(0, 6);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const track   = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getDistance = () => track.scrollWidth - section.clientWidth + 96;

      /* Heading */
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 60, filter: "blur(8px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
        }
      );

      /* Horizontal scroll pin */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance() + 240}`,
          scrub: 1.4,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current)
              progressRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      tl.to(track, { x: () => -(getDistance()), ease: "none" });

      /* Cards stagger-in */
      gsap.utils.toArray<HTMLElement>(".bseller-card").forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.92, filter: "blur(8px)" },
          {
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
            duration: 0.8, ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tl,
              start: "left 92%",
              toggleActions: "play none none none",
            },
            delay: i * 0.05,
          }
        );
      });

      /* CTA */
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: ctaRef.current, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });

    /* Mobile — simple vertical stagger */
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" } }
      );
      gsap.utils.toArray<HTMLElement>(".bseller-card").forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "expo.out",
            delay: i * 0.08,
            scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ background: "#06060f" }}>
      {/* Background accent */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 10% 50%, rgba(18,50,160,0.09) 0%, transparent 65%)",
      }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.018) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="relative px-6 md:px-12 pt-24 md:pt-32 pb-8">

        {/* Section heading */}
        <div ref={headingRef} className="mb-14 md:mb-16" style={{ opacity: 0 }}>
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Bestsellers
            </span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <h2 className="font-black text-white uppercase leading-[0.9] tracking-tight"
              style={{ fontSize: "clamp(2.2rem,5.5vw,4.5rem)", letterSpacing: "-0.02em" }}>
              Les modèles<br />préférés
            </h2>
            <p className="text-[0.88rem] leading-relaxed hidden md:block max-w-xs" style={{ color: "#565870" }}>
              Six pièces iconiques, toutes en stock — prêtes à livrer sous 7 à 15 jours.
            </p>
          </div>

          {/* Scroll progress */}
          <div className="mt-8 hidden md:block" style={{ height: 1, background: "rgba(255,255,255,0.07)", position: "relative" }}>
            <div ref={progressRef} className="absolute inset-y-0 left-0"
              style={{
                background: "linear-gradient(to right, rgba(58,142,255,0.8), rgba(100,170,255,0.4))",
                width: "100%",
                transform: "scaleX(0)",
                transformOrigin: "left",
                boxShadow: "0 0 12px rgba(58,142,255,0.5)",
              }} />
          </div>
        </div>

        {/* Horizontal track */}
        <div ref={trackRef} className="flex gap-5 md:gap-6 will-change-transform pb-8">
          {products.map((p, i) => (
            <div key={p.id}
              className="bseller-card relative shrink-0"
              style={{ width: "min(82vw, 360px)", opacity: 0 }}>
                  <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div ref={ctaRef} className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-12" style={{ opacity: 0 }}>
          <Link href="/collections/all" className="btn-chrome">
            Voir toute la collection →
          </Link>
          <Link href="/collections/packs" className="btn-ghost">
            Packs & offres
          </Link>
        </div>
      </div>
    </section>
  );
}
