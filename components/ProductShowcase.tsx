"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PRODUCT_IMG =
  "https://cdn.shopify.com/s/files/1/0921/9312/8788/files/WhatsApp_Image_2026-04-23_at_18.23.27_7.jpg";

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          imgRef.current,
          { opacity: 0, scale: 0.96, x: 60 },
          {
            opacity: 1, scale: 1, x: 0, duration: 1.3, ease: "expo.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
            },
          },
        );
        gsap.fromTo(
          textRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1, x: 0, duration: 1.2, ease: "expo.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 68%",
            },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #06060f 0%, #020310 50%, #06060f 100%)" }}
    >
      {/* Subtle separator */}
      <div style={{ height: 1, background: "rgba(58,142,255,0.06)" }} />

      <div className="flex flex-col lg:flex-row min-h-[70vh]">

        {/* ── Left: Text ── */}
        <div
          ref={textRef}
          className="flex flex-col justify-center px-8 md:px-14 xl:px-20 py-16 lg:py-0 w-full lg:w-[42%] shrink-0"
          style={{ zIndex: 2 }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.4)" }} />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: "0.58rem",
                letterSpacing: "0.3em",
                color: "rgba(58,142,255,0.6)",
              }}
            >
              Pièce phare · A220-300
            </span>
          </div>

          {/* Headline */}
          <h2
            className="font-black uppercase text-white"
            style={{
              fontFamily: "var(--font-space), var(--font-inter), sans-serif",
              fontSize: "clamp(2.6rem, 4.5vw, 5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              marginBottom: "1.6rem",
            }}
          >
            A220<br />
            <span
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(255,255,255,0.75)",
              }}
            >
              Air France.
            </span>
          </h2>

          {/* Specs */}
          <div
            className="flex flex-col gap-3 mb-8"
            style={{ borderLeft: "1px solid rgba(58,142,255,0.15)", paddingLeft: "1rem" }}
          >
            {[
              ["Modèle", "A220-300 · Immatriculation F-CDG"],
              ["Échelle", "1/100 · 47 cm d'envergure"],
              ["Finition", "Peinture main · LED cockpit intégré"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span
                  className="font-mono uppercase"
                  style={{ fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(58,142,255,0.5)" }}
                >
                  {label}
                </span>
                <span style={{ fontSize: "0.88rem", color: "rgba(200,215,240,0.8)", lineHeight: 1.5 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-5 flex-wrap">
            <div>
              <div
                className="font-mono uppercase mb-1"
                style={{ fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)" }}
              >
                À partir de
              </div>
              <div
                className="font-black text-white"
                style={{
                  fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                  fontSize: "2.2rem",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                89€
              </div>
            </div>

            <Link
              href="/products/airbus-a220-air-france"
              className="inline-flex items-center gap-2.5 font-black uppercase"
              style={{
                fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                color: "#ffffff",
                background: "linear-gradient(135deg, #1a4aff, #0a2fd4)",
                borderRadius: 999,
                padding: "0.9rem 1.8rem",
                boxShadow: "0 8px 32px -8px rgba(26,74,255,0.6)",
                transition: "transform 0.2s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 40px -8px rgba(26,74,255,0.75)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px -8px rgba(26,74,255,0.6)";
              }}
            >
              Voir le produit →
            </Link>
          </div>
        </div>

        {/* ── Right: Product photo ── */}
        <div
          ref={imgRef}
          className="relative w-full lg:w-[58%] flex items-center justify-center overflow-hidden"
          style={{ minHeight: "clamp(300px,45vw,680px)" }}
        >
          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PRODUCT_IMG}
            alt="Airbus A220-300 Air France — maquette résine 1/100"
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />

          {/* Left vignette to blend into the dark left panel */}
          <div
            className="absolute inset-y-0 left-0 pointer-events-none"
            style={{
              width: "22%",
              background:
                "linear-gradient(to right, #020310, transparent)",
            }}
          />
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(58,142,255,0.06)" }} />
    </section>
  );
}
