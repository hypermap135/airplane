"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    num: "01",
    title: "Indestructible. Pour toujours.",
    body: "Résine monobloc — immuable. 47 cm de présence sur votre bureau, votre étagère, votre salon. Dix ans, vingt ans — exactement la même pièce.",
    image: "/images/a320-new-livery-af.png",
    imageAlt: "A320 Air France new livery — résine premium, fond noir studio",
    imageLeft: true,
  },
  {
    num: "02",
    title: "Le cockpit s'éveille.",
    body: "Un tap sur le fuselage ou un clap des mains — le fuselage s'allume, le cockpit aussi. Vingt secondes de show, puis extinction automatique pour préserver la durée de vie de la batterie. Une sculpture lumineuse à la demande.",
    image: "/images/a380-emirates.png",
    imageAlt: "A380 — éclairage LED intégré",
    imageLeft: false,
  },
  {
    num: "03",
    title: "Chaque rivet à sa place.",
    body: "Livrée reproduite au 1/147e. Peinture main, train amovible, hublots gravés. L'exactitude comme signature.",
    image: "https://cdn.shopify.com/s/files/1/0921/9312/8788/files/Airbus_A350_Air_France_cote_gauche_nobg.png",
    imageAlt: "A350 Air France — détail livrée 1/147e",
    imageLeft: true,
  },
];

export default function UniqueFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading reveal
        gsap.set(headingRef.current, { opacity: 0, y: 70, filter: "blur(10px)" });
        gsap.to(headingRef.current, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 88%" },
        });

        // Each feature row reveal
        gsap.utils.toArray<HTMLElement>(".uf-row").forEach((row) => {
          gsap.set(row, { opacity: 0, y: 60 });
          gsap.to(row, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });

        // Image reveal (slightly offset)
        gsap.utils.toArray<HTMLElement>(".uf-img-wrap").forEach((wrap) => {
          gsap.set(wrap, { scale: 1.06, filter: "blur(8px)" });
          gsap.to(wrap, {
            scale: 1,
            filter: "blur(0px)",
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: {
              trigger: wrap,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".uf-row", { opacity: 1, y: 0 });
        gsap.set(".uf-img-wrap", { scale: 1, filter: "none" });
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
      {/* Section heading */}
      <div
        ref={headingRef}
        className="relative pt-24 md:pt-36 pb-16 md:pb-24 text-center px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div style={{ width: 32, height: 1, background: "rgba(58,142,255,0.5)" }} />
          <span
            className="font-mono text-[0.63rem] tracking-[0.3em] uppercase"
            style={{ color: "rgba(58,142,255,0.6)" }}
          >
            Savoir-faire
          </span>
          <div style={{ width: 32, height: 1, background: "rgba(58,142,255,0.5)" }} />
        </div>

        <h2
          className="font-black uppercase leading-[0.88] tracking-tight"
          style={{
            fontSize: "clamp(3rem,7vw,6rem)",
            letterSpacing: "-0.025em",
            background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          L&apos;obsession du détail.
        </h2>
      </div>

      {/* Feature rows */}
      <div className="relative">
        {FEATURES.map((f, idx) => (
          <div key={f.num}>
            {/* Top divider */}
            <div
              aria-hidden
              style={{ height: 1, background: "rgba(255,255,255,0.06)" }}
            />

            <div
              className={`uf-row relative flex flex-col ${
                f.imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-stretch`}
              style={{ minHeight: "80vh" }}
            >
              {/* Image side */}
              <div className="relative w-full lg:w-1/2 overflow-hidden" style={{ minHeight: 380 }}>
                <div className="uf-img-wrap absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt={f.imageAlt}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    onLoad={(e) => e.currentTarget.classList.add("loaded")}
                    ref={(el) => {
                      if (el && el.complete && el.naturalWidth > 0) el.classList.add("loaded");
                    }}
                  />
                  {/* Gradient overlay blending into dark bg */}
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: f.imageLeft
                        ? "linear-gradient(to right, transparent 55%, #06060f 100%), linear-gradient(to bottom, rgba(6,6,15,0.3) 0%, transparent 30%)"
                        : "linear-gradient(to left, transparent 55%, #06060f 100%), linear-gradient(to bottom, rgba(6,6,15,0.3) 0%, transparent 30%)",
                    }}
                  />
                </div>
              </div>

              {/* Text side */}
              <div
                className={`relative w-full lg:w-1/2 flex items-center px-8 md:px-16 lg:px-20 py-16 lg:py-0`}
              >
                {/* Giant ghost number */}
                <div
                  aria-hidden
                  className="absolute font-black pointer-events-none select-none leading-none"
                  style={{
                    fontSize: "clamp(6rem,12vw,14rem)",
                    opacity: 0.07,
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: f.imageLeft ? "1rem" : "auto",
                    right: f.imageLeft ? "auto" : "1rem",
                    color: "#ffffff",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {f.num}
                </div>

                <div className="relative" style={{ maxWidth: 520 }}>
                  {/* Visible number */}
                  <div
                    className="font-mono font-bold mb-4"
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.28em",
                      color: "rgba(58,142,255,0.55)",
                    }}
                  >
                    {f.num}
                  </div>

                  <h3
                    className="font-black uppercase leading-[0.9] tracking-tight mb-6"
                    style={{
                      fontSize: "clamp(2rem,4vw,3.25rem)",
                      letterSpacing: "-0.02em",
                      background:
                        "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {f.title}
                  </h3>

                  <div
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(to right, rgba(58,142,255,0.35), transparent)",
                      marginBottom: "1.5rem",
                      width: 80,
                    }}
                  />

                  <p
                    className="leading-[1.8]"
                    style={{
                      fontSize: "clamp(0.95rem,1.5vw,1.1rem)",
                      color: "#6a7080",
                    }}
                  >
                    {f.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bottom divider */}
        <div
          aria-hidden
          style={{ height: 1, background: "rgba(255,255,255,0.06)" }}
        />
      </div>

      {/* Bottom padding */}
      <div className="pb-24 md:pb-36" />
    </section>
  );
}
