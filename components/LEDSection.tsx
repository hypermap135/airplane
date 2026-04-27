"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  { label: "Durée", value: "~20s" },
  { label: "Batterie", value: "75 mAh" },
  { label: "Charge", value: "~1h USB" },
  { label: "Zones LED", value: "Fuselage + Cockpit" },
];

export default function LEDSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(imgRef.current, { opacity: 0, x: -60, scale: 0.92, filter: "blur(12px)" });
        gsap.to(imgRef.current,
          { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
        );
        gsap.set(textRef.current, { opacity: 0, x: 60, filter: "blur(8px)" });
        gsap.to(textRef.current,
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }
        );
        gsap.set(".led-spec", { opacity: 0, y: 20, scale: 0.9 });
        gsap.to(".led-spec",
          { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.7, ease: "back.out(2)",
            scrollTrigger: { trigger: sectionRef.current, start: "top 65%" } }
        );
        // Pulse glow
        gsap.to(glowRef.current, {
          opacity: 0.9,
          scale: 1.15,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([imgRef.current, textRef.current, ".led-spec"], { opacity: 1, x: 0, scale: 1, filter: "none" });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: "#060612" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 55% at 65% 50%, rgba(30,70,200,0.11) 0%, transparent 65%)",
      }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.018) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 grid gap-14 lg:grid-cols-2 items-center">

        {/* Image */}
        <div ref={imgRef} className="relative order-2 lg:order-1">
          {/* Outer glow ring */}
          <div ref={glowRef} aria-hidden className="absolute -inset-3 pointer-events-none"
            style={{
              borderRadius: "1.75rem",
              background: "transparent",
              boxShadow: "0 0 60px rgba(58,142,255,0.35), 0 0 120px rgba(58,142,255,0.15)",
              opacity: 0.5,
            }} />

          {/* Frame */}
          <div className="relative overflow-hidden" style={{ borderRadius: "1.5rem", aspectRatio: "1/1" }}>
            {/* Airplane image — referrerPolicy bypasses CDN hotlink protection */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {!imgError ? (
              <img
                src="https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg"
                alt="Maquette A380 Air France éclairée"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback: ambient blue dark panel that looks great with the LED overlay */
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(14,30,80,0.9) 0%, rgba(4,4,18,0.98) 100%)",
              }}>
                <svg className="absolute inset-0 m-auto opacity-[0.07]" width="180" height="90" viewBox="0 0 180 90" fill="none">
                  <path d="M10 62 L50 28 L120 24 L164 50 L120 50 L96 62 Z" fill="white"/>
                  <path d="M50 42 L50 66 L38 72" stroke="white" strokeWidth="3"/>
                  <path d="M96 50 L96 72 L84 78" stroke="white" strokeWidth="3"/>
                </svg>
              </div>
            )}

            {/* Pulsing LED overlay */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(58,142,255,0.45) 0%, transparent 70%), linear-gradient(180deg, rgba(6,6,18,0.5) 0%, rgba(6,6,18,0.88) 100%)",
              animation: "ledPulse 2.4s ease-in-out infinite",
            }} />

            {/* LED badge */}
            <div className="absolute bottom-5 left-5 flex items-center gap-2.5 px-3.5 py-2"
              style={{
                borderRadius: 999,
                background: "rgba(6,6,18,0.75)",
                border: "1px solid rgba(58,142,255,0.35)",
                backdropFilter: "blur(12px)",
              }}>
              <span aria-hidden className="w-2 h-2 rounded-full"
                style={{ background: "#3a8eff", boxShadow: "0 0 8px rgba(58,142,255,0.9)", animation: "blink 1.4s ease-in-out infinite" }} />
              <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase" style={{ color: "rgba(100,170,255,0.9)" }}>
                LED ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div ref={textRef} className="order-1 lg:order-2">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Fonctionnalité exclusive
            </span>
          </div>

          <h2 className="font-black uppercase leading-[0.88] tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.8rem,6.5vw,5.5rem)",
              letterSpacing: "-0.02em",
            }}>
            <span style={{
              background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Un geste.
            </span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #3a8eff 0%, #7ab8ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Elle s'illumine.
            </span>
          </h2>

          <p className="text-[1.02rem] leading-[1.75] mb-10" style={{ color: "#6a7080", maxWidth: 440 }}>
            LED intégré dans le fuselage et le cockpit. Fuselage et cockpit illuminés
            environ 20 secondes. Interrupteur sous le socle. Batterie lithium rechargeable
            par USB — câble inclus.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10" style={{ maxWidth: 420 }}>
            {SPECS.map((s) => (
              <div key={s.label} className="led-spec flex flex-col gap-1.5 px-4 py-4"
                style={{
                  borderRadius: "1rem",
                  background: "#0c0c1a",
                  border: "1px solid #1c1c2e",
                }}>
                <div className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "#444858" }}>
                  {s.label}
                </div>
                <div className="font-bold text-white text-[0.95rem]">{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "linear-gradient(to right, rgba(58,142,255,0.4) 0%, transparent 70%)", marginBottom: "1.25rem" }} />
          <p className="font-mono text-[0.63rem] tracking-[0.2em] uppercase" style={{ color: "#3a4055" }}>
            Câble de charge inclus · Interrupteur sous le socle
          </p>
        </div>
      </div>
    </section>
  );
}
