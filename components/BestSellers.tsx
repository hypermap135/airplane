"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";
import { PRODUCTS, sortForDisplay } from "@/lib/products";

gsap.registerPlugin(ScrollTrigger);

export default function BestSellers() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  // Show bestsellers first, then other in-stock products
  const products = sortForDisplay(PRODUCTS.filter((p) => p.inStock && p.collection !== "accessoires")).slice(0, 8);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Heading */
        gsap.set(headingRef.current, { opacity: 0, y: 60, filter: "blur(8px)" });
        gsap.to(headingRef.current, {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", toggleActions: "play none none none" },
        });

        /* Cards stagger */
        gsap.utils.toArray<HTMLElement>(".bseller-card").forEach((card, i) => {
          gsap.set(card, { opacity: 0, y: 60, scale: 0.93, filter: "blur(8px)" });
          gsap.to(card, {
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
            duration: 0.9, ease: "expo.out",
            delay: (i % 4) * 0.1,
            scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none none" },
          });
        });

        /* CTA */
        gsap.set(ctaRef.current, { opacity: 0, y: 32 });
        gsap.to(ctaRef.current, {
          opacity: 1, y: 0, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 88%", toggleActions: "play none none none" },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([headingRef.current, ".bseller-card", ctaRef.current], { opacity: 1, y: 0, scale: 1, filter: "none" });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #010108 0%, #06060f 15%, #06060f 85%, #010108 100%)",
      }}
    >
      {/* Background accent */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 10% 50%, rgba(18,50,160,0.09) 0%, transparent 65%)",
      }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.018) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="relative px-6 md:px-12 pt-24 md:pt-32 pb-16">

        {/* Section heading */}
        <div ref={headingRef} className="mb-12 md:mb-16">

          {/* Eyebrow row — accent line + label */}
          <div className="flex items-center gap-4 mb-6">
            <div
              aria-hidden
              style={{
                width: 40,
                height: 1,
                background: "rgba(58,142,255,0.6)",
                flexShrink: 0,
              }}
            />
            <span
              className="font-mono text-[0.6rem] tracking-[0.3em] uppercase"
              style={{ color: "rgba(58,142,255,0.65)" }}
            >
              Sélection · Bestsellers
            </span>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <h2
                className="font-black text-white leading-[0.88] mb-4"
                style={{
                  fontSize: "clamp(2.8rem, 5vw, 5.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Les plus aimés.
              </h2>
              <p
                className="text-[0.88rem] leading-relaxed"
                style={{ color: "#565870", maxWidth: 420 }}
              >
                Sélectionnés parmi +2 000 commandes. Pilotes, collectionneurs, passionnés — c&apos;est ce qu&apos;ils ont choisi en premier.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(i => (
                  <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.9rem" }}>★</span>
                ))}
                <span
                  className="font-mono text-[0.62rem] tracking-[0.12em] ml-1"
                  style={{ color: "#565870" }}
                >
                  4.8 · +2 000 avis
                </span>
              </div>
              <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
              <span
                className="font-mono text-[0.6rem] tracking-[0.18em] uppercase"
                style={{ color: "#565870" }}
              >
                Livraison 7–15 jours
              </span>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((p) => (
            <div key={p.id} className="bseller-card">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div ref={ctaRef} className="mt-12 flex flex-wrap items-center justify-center gap-4">
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
