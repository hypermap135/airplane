"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EXAMPLES = [
  { text: "Commandant Dupont" },
  { text: "Vol AF001 — 15/06/2024" },
  { text: "Joyeux anniversaire Papa" },
];

export default function PersonalizationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const imgElemRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(textRef.current,
          { opacity: 0, x: -50, filter: "blur(10px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
        );
        gsap.fromTo(imageRef.current,
          { opacity: 0, x: 50, scale: 0.95, filter: "blur(10px)" },
          { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
        );
        gsap.fromTo(".perso-example",
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.7, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } }
        );
        // Image parallax
        gsap.to(imgElemRef.current, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([textRef.current, imageRef.current, ".perso-example"], { opacity: 1, x: 0, scale: 1, filter: "none" });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: "#040410" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 55% at 75% 50%, rgba(20,50,160,0.09) 0%, transparent 65%)",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 grid gap-14 lg:grid-cols-2 items-center">

        {/* Text */}
        <div ref={textRef} style={{ opacity: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Gravure +15€
            </span>
          </div>

          <h2 className="font-black uppercase leading-[0.9] tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.5rem,6vw,5rem)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            Votre nom<br />sur le socle.
          </h2>

          <p className="text-[1.02rem] leading-[1.75] mb-10" style={{ color: "#6a7080", maxWidth: 420 }}>
            Faites graver un nom, une date ou une immatriculation sur le socle en bois.
            Une pièce vraiment unique, pensée pour durer.
          </p>

          <div className="space-y-3 mb-10">
            {EXAMPLES.map((e) => (
              <div key={e.text}
                className="perso-example flex items-center gap-4 px-5 py-3.5 transition-all duration-300 group cursor-default"
                style={{
                  borderRadius: "0.875rem",
                  background: "#0c0c1a",
                  border: "1px solid #1c1c2e",
                  opacity: 0,
                }}
                onMouseEnter={e2 => { (e2.currentTarget as HTMLDivElement).style.border = "1px solid rgba(58,142,255,0.3)"; }}
                onMouseLeave={e2 => { (e2.currentTarget as HTMLDivElement).style.border = "1px solid #1c1c2e"; }}
              >
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase shrink-0" style={{ color: "rgba(58,142,255,0.5)" }}>
                  EX.
                </span>
                <span className="font-mono text-[0.85rem] text-white/80 group-hover:text-white transition-colors">
                  &quot;{e.text}&quot;
                </span>
              </div>
            ))}
          </div>

          <Link href="/products/gravure-personnalisee" className="btn-chrome">
            Ajouter une gravure →
          </Link>
        </div>

        {/* Image */}
        <div ref={imageRef} className="relative overflow-hidden"
          style={{ borderRadius: "1.5rem", aspectRatio: "4/5", opacity: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgElemRef}
            src="https://airplanestore.fr/cdn/shop/files/gravure.jpg"
            alt="Gravure personnalisée sur socle bois"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ top: "-12%", height: "124%" }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {/* Bottom overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to top, rgba(4,4,16,0.92) 0%, rgba(4,4,16,0.3) 40%, transparent 70%)",
          }} />
          {/* Caption */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="font-mono text-[0.62rem] tracking-[0.22em] uppercase mb-1.5" style={{ color: "rgba(58,142,255,0.6)" }}>
              Socle bois massif · Gravure laser
            </div>
            <div className="font-bold text-white text-sm">À partir de 15€</div>
          </div>
          {/* Active dot */}
          <div aria-hidden className="absolute top-5 right-5 w-2 h-2 rounded-full"
            style={{ background: "#3a8eff", boxShadow: "0 0 8px rgba(58,142,255,0.8)", animation: "blink 3s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}
