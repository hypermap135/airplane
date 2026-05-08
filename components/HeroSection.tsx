"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { motion, useScroll, useTransform } from "framer-motion";

const LIFESTYLE_IMG =
  "https://cdn.shopify.com/s/files/1/0921/9312/8788/files/WhatsApp_Image_2026-04-23_at_18.23.27_12.jpg";

export default function HeroSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const eyebrowRef   = useRef<HTMLDivElement>(null);
  const line1Ref     = useRef<HTMLDivElement>(null);
  const line2Ref     = useRef<HTMLDivElement>(null);
  const bodyRef      = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const marqRef      = useRef<HTMLDivElement>(null);

  /* Scroll parallax on the background photo */
  const { scrollY } = useScroll();
  const bgY         = useTransform(scrollY, [0, 700], ["0%", "18%"]);
  const textY        = useTransform(scrollY, [0, 500], [0, -60]);
  const textOpacity  = useTransform(scrollY, [0, 380], [1, 0]);

  /* Entry animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(eyebrowRef.current, { opacity: 0, y: 16 });
        gsap.set(line1Ref.current,   { opacity: 0, y: 100, skewY: 4 });
        gsap.set(line2Ref.current,   { opacity: 0, y: 100, skewY: 4 });
        gsap.set(bodyRef.current,    { opacity: 0, y: 24 });
        gsap.set(ctaRef.current,     { opacity: 0, y: 20 });
        gsap.set(marqRef.current,    { opacity: 0 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl
          .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 1.0 }, 0.3)
          .to(line1Ref.current,   { opacity: 1, y: 0, skewY: 0, duration: 1.5 }, 0.5)
          .to(line2Ref.current,   { opacity: 1, y: 0, skewY: 0, duration: 1.5 }, 0.75)
          .to(bodyRef.current,    { opacity: 1, y: 0, duration: 1.0 }, 1.1)
          .to(ctaRef.current,     { opacity: 1, y: 0, duration: 1.0 }, 1.3)
          .to(marqRef.current,    { opacity: 1, duration: 0.8 }, 1.7);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [eyebrowRef.current, line1Ref.current, line2Ref.current,
           bodyRef.current, ctaRef.current, marqRef.current],
          { opacity: 1, y: 0, skewY: 0 },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const marqueeItems = [
    "★ LED intégré", "Résine coulée", "Peinture main", "Livraison 7–15j",
    "Retour 30j", "1 847 clients", "4.8 / 5",
    "★ LED intégré", "Résine coulée", "Peinture main", "Livraison 7–15j",
    "Retour 30j", "1 847 clients", "4.8 / 5",
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#04040e" }}
    >
      {/* ── Background photo with scroll parallax ── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LIFESTYLE_IMG}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
          fetchPriority="high"
        />

        {/* Dark overlay — heavier left + bottom for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(2,2,12,0.88) 0%, rgba(2,2,12,0.60) 45%, rgba(2,2,12,0.20) 75%, rgba(2,2,12,0.08) 100%)",
          }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "45%",
            background:
              "linear-gradient(to top, rgba(2,2,12,0.95) 0%, transparent 100%)",
          }}
        />
        {/* Top vignette */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "18%",
            background:
              "linear-gradient(to bottom, rgba(2,2,12,0.6) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ── Text content ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex-1 flex items-center"
      >
        <div className="px-6 md:px-12 xl:px-20 pt-32 pb-16 w-full max-w-3xl">

          {/* Eyebrow */}
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-10">
            <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.55)" }} />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.35em",
                color: "rgba(58,142,255,0.7)",
              }}
            >
              ★ Collection · Résine Premium
            </span>
          </div>

          {/* H1 */}
          <div style={{ maxWidth: 680 }}>
            <div className="overflow-hidden" style={{ marginBottom: "0.02em" }}>
              <div
                ref={line1Ref}
                className="font-black uppercase text-white select-none"
                style={{
                  fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                  fontSize: "clamp(3.8rem, 7.5vw, 8.5rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                  textShadow: "0 2px 40px rgba(0,0,30,0.5)",
                }}
              >
                L&apos;Aviation
              </div>
            </div>
            <div className="overflow-hidden">
              <div
                ref={line2Ref}
                className="font-black uppercase select-none"
                style={{
                  fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                  fontSize: "clamp(3.8rem, 7.5vw, 8.5rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                  color: "transparent",
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.9)",
                  textShadow: "none",
                }}
              >
                en Résine.
              </div>
            </div>
          </div>

          {/* Body */}
          <div ref={bodyRef} style={{ marginTop: "2.25rem" }}>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: 420,
                color: "rgba(200,210,230,0.75)",
              }}
            >
              47 cm de présence sur votre bureau. Résine coulée sous
              pression, peinture main, LED intégré. Chaque pièce est unique.
            </p>
          </div>

          {/* CTA */}
          <div ref={ctaRef} style={{ marginTop: "2.5rem" }}>
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-3 font-black uppercase"
              style={{
                fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                fontSize: "0.78rem",
                letterSpacing: "0.14em",
                color: "#010108",
                background: "#ffffff",
                borderRadius: 999,
                padding: "1rem 2rem",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.1), 0 12px 40px -10px rgba(0,0,0,0.5)",
                transition:
                  "transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "#010108";
                el.style.color = "#ffffff";
                el.style.boxShadow =
                  "0 0 0 1px rgba(255,255,255,0.18), 0 20px 60px -12px rgba(58,142,255,0.5)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "#ffffff";
                el.style.color = "#010108";
                el.style.boxShadow =
                  "0 0 0 1px rgba(255,255,255,0.1), 0 12px 40px -10px rgba(0,0,0,0.5)";
                el.style.transform = "translateY(0)";
              }}
            >
              Découvrir la collection
              <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>→</span>
            </Link>

            {/* Social proof */}
            <div className="flex items-center gap-2.5 mt-5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} aria-hidden style={{ color: "#ffffff", fontSize: "0.8rem", opacity: 0.9 }}>★</span>
                ))}
              </div>
              <span className="font-black text-white" style={{ fontSize: "0.82rem" }}>4.8</span>
              <span
                className="font-mono uppercase"
                style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}
              >
                · 1 847 clients · Retour 30 j
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Price badge — floating, top-right */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute top-[22%] right-[6%] z-20 hidden lg:flex flex-col gap-2 items-end"
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{
            borderRadius: 999,
            background: "rgba(4,4,20,0.72)",
            border: "1px solid rgba(58,142,255,0.28)",
            backdropFilter: "blur(16px)",
          }}
        >
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "#3a8eff", boxShadow: "0 0 8px rgba(58,142,255,1)" }}
          />
          <span
            className="font-mono uppercase"
            style={{ fontSize: "0.57rem", letterSpacing: "0.22em", color: "rgba(100,165,255,0.88)" }}
          >
            Bestseller · 1 847 vendus
          </span>
        </div>

        <div
          className="px-4 py-3 text-right"
          style={{
            borderRadius: "0.875rem",
            background: "rgba(4,4,20,0.55)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            className="font-mono uppercase mb-0.5"
            style={{ fontSize: "0.53rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)" }}
          >
            À partir de
          </div>
          <div
            className="font-black text-white leading-none"
            style={{
              fontFamily: "var(--font-space), var(--font-inter), sans-serif",
              fontSize: "1.75rem",
              letterSpacing: "-0.03em",
            }}
          >
            59€
          </div>
        </div>
      </motion.div>

      {/* ── Bottom marquee ── */}
      <div ref={marqRef} className="relative z-10">
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <div
          className="overflow-hidden py-3.5"
          style={{ background: "rgba(2,2,12,0.75)", backdropFilter: "blur(10px)" }}
        >
          <div className="marquee-track">
            {marqueeItems.map((item, i) => (
              <span
                key={i}
                className="font-mono uppercase shrink-0"
                style={{
                  fontSize: "0.57rem",
                  letterSpacing: "0.24em",
                  color: "rgba(255,255,255,0.22)",
                  margin: "0 2rem",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
