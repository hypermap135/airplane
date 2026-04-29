"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EXAMPLES = [
  { text: "Commandant Dupont" },
  { text: "Vol AF001 — 15/06/2024" },
  { text: "Joyeux anniversaire Papa" },
  { text: "F-WXWB — Premier vol" },
];

export default function PersonalizationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const imgElemRef = useRef<HTMLImageElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(textRef.current, { opacity: 0, x: -50, filter: "blur(10px)" });
        gsap.to(textRef.current,
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
        );
        gsap.set(imageRef.current, { opacity: 0, x: 50, scale: 0.95, filter: "blur(10px)" });
        gsap.to(imageRef.current,
          { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
        );
        gsap.set(".perso-example", { opacity: 0, x: -24 });
        gsap.to(".perso-example",
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
        <div ref={textRef}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Option gravure · +15€
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
            Un nom. Une date. Une immatriculation. Gravés au laser sur le socle
            en bois massif — pour toujours.
          </p>

          <div className="space-y-3 mb-10">
            {EXAMPLES.map((e) => (
              <div key={e.text}
                className="perso-example flex items-center gap-4 px-5 py-3.5 transition-all duration-300 group cursor-default"
                style={{
                  borderRadius: "0.875rem",
                  background: "#0c0c1a",
                  border: "1px solid #1c1c2e",
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

          <p className="text-[0.92rem] leading-[1.75] mb-6" style={{ color: "#565870", maxWidth: 400 }}>
            Offrir une maquette, c&apos;est bien. Offrir une maquette avec un nom gravé dessus — c&apos;est inoubliable.
          </p>
          <Link href="/products/gravure-personnalisee" className="btn-chrome">
            Ajouter une gravure →
          </Link>
        </div>

        {/* Image */}
        <div ref={imageRef} className="relative overflow-hidden"
          style={{ borderRadius: "1.5rem", aspectRatio: "4/5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {!imgError ? (
            <img
              ref={imgElemRef}
              src="https://airplanestore.fr/cdn/shop/files/gravure.jpg"
              alt="Gravure personnalisée sur socle bois"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ top: "-12%", height: "124%" }}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            /* Fallback: dark wood texture feel */
            <div className="absolute inset-0" style={{
              background: "linear-gradient(160deg, #0e0a06 0%, #1a1208 40%, #0c0a08 100%)",
            }}>
              {/* Engraving illustration */}
              <svg className="absolute inset-0 m-auto opacity-10" width="120" height="80" viewBox="0 0 120 80" fill="none">
                <rect x="10" y="10" width="100" height="60" rx="4" stroke="white" strokeWidth="1.5"/>
                <rect x="20" y="30" width="80" height="2" fill="white" opacity="0.6"/>
                <rect x="20" y="38" width="60" height="2" fill="white" opacity="0.4"/>
                <rect x="20" y="46" width="70" height="2" fill="white" opacity="0.3"/>
              </svg>
            </div>
          )}
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
