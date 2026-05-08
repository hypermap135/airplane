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
  const sectionRef  = useRef<HTMLElement>(null);
  const imgRef      = useRef<HTMLDivElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);
  const orbRef      = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Section entrance — image slides in from left
        gsap.set(imgRef.current, { opacity: 0, x: -70, scale: 0.93, filter: "blur(14px)" });
        gsap.to(imgRef.current, {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        });

        // Text slides in from right
        gsap.set(textRef.current, { opacity: 0, x: 70, filter: "blur(10px)" });
        gsap.to(textRef.current, {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        });

        // Orb expands on scroll in
        gsap.set(orbRef.current, { opacity: 0, scale: 0.4 });
        gsap.to(orbRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        });

        // Spec tiles stagger up
        gsap.set(".led-spec", { opacity: 0, y: 24, scale: 0.88 });
        gsap.to(".led-spec", {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
        });

        // Pulse glow ring on image — continuous
        gsap.to(glowRef.current, {
          opacity: 0.9,
          scale: 1.18,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Orb ambient breathe
        gsap.to(orbRef.current, {
          opacity: 0.75,
          scale: 1.08,
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.6,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [imgRef.current, textRef.current, orbRef.current, ".led-spec"],
          { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #06060f 0%, #020415 50%, #06060f 100%)",
      }}
    >
      {/* Chapter marker divider */}
      <div
        className="relative flex items-center justify-center"
        style={{ padding: "0 2rem" }}
      >
        <div
          aria-hidden
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="font-mono text-[0.6rem] tracking-[0.35em] uppercase px-5"
          style={{ color: "rgba(255,180,77,0.65)", whiteSpace: "nowrap" }}
        >
          LED Cockpit Intégré
        </div>
        <div
          aria-hidden
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
        />
      </div>

      {/* Ambient orb — warm cabin glow (yellow/amber) */}
      <div
        ref={orbRef}
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,180,77,0.35) 0%, rgba(255,140,40,0.12) 40%, transparent 70%)",
          top: "50%",
          left: "25%",
          transform: "translate(-50%, -50%)",
          filter: "blur(50px)",
        }}
      />

      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(58,142,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.016) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative py-24 md:py-36">
        <div className="grid gap-14 lg:grid-cols-2 items-center w-full px-6 md:px-12 lg:px-16 max-w-none mx-auto xl:max-w-[1600px]">

          {/* ── Image (full-bleed left) ── */}
          <div ref={imgRef} className="relative order-2 lg:order-1">
            {/* Outer pulsing glow ring — warm amber */}
            <div
              ref={glowRef}
              aria-hidden
              className="absolute -inset-4 pointer-events-none"
              style={{
                borderRadius: "2rem",
                boxShadow:
                  "0 0 80px rgba(255,180,77,0.55), 0 0 160px rgba(255,140,40,0.25)",
                opacity: 0.55,
              }}
            />

            {/* Frame */}
            <div
              className="relative overflow-hidden w-full"
              style={{ borderRadius: "1.75rem", aspectRatio: "1/1" }}
            >
              {/* Airplane image — A220 Air France LED active */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {!imgError ? (
                <img
                  src="/led/a220-on.jpg"
                  alt="Maquette A220 Air France avec LED cabine activé — éclairage intérieur jaune"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onLoad={(e) => e.currentTarget.classList.add("loaded")}
                  ref={(el) => {
                    if (el && el.complete && el.naturalWidth > 0) el.classList.add("loaded");
                  }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(14,30,80,0.9) 0%, rgba(4,4,18,0.98) 100%)",
                  }}
                >
                  <svg
                    className="absolute inset-0 m-auto opacity-[0.07]"
                    width="180"
                    height="90"
                    viewBox="0 0 180 90"
                    fill="none"
                  >
                    <path
                      d="M10 62 L50 28 L120 24 L164 50 L120 50 L96 62 Z"
                      fill="white"
                    />
                    <path
                      d="M50 42 L50 66 L38 72"
                      stroke="white"
                      strokeWidth="3"
                    />
                    <path
                      d="M96 50 L96 72 L84 78"
                      stroke="white"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              )}

              {/* LED pulse overlay — warm amber cabin glow */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 50% at 50% 55%, rgba(255,180,77,0.32) 0%, rgba(255,140,40,0.12) 40%, transparent 75%), linear-gradient(180deg, rgba(8,4,2,0.25) 0%, rgba(4,2,8,0.55) 100%)",
                  animation: "ledPulse 2.4s ease-in-out infinite",
                  mixBlendMode: "screen",
                }}
              />
              {/* Subtle window-row glow sheen on top of fuselage area */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 8% at 50% 50%, rgba(255,200,100,0.28) 0%, transparent 80%)",
                  filter: "blur(2px)",
                }}
              />

              {/* LED active badge — amber */}
              <div
                className="absolute bottom-5 left-5 flex items-center gap-2.5 px-3.5 py-2"
                style={{
                  borderRadius: 999,
                  background: "rgba(20,10,2,0.82)",
                  border: "1px solid rgba(255,180,77,0.45)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 0 12px rgba(255,140,40,0.18)",
                }}
              >
                <span
                  aria-hidden
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "#ffb84d",
                    boxShadow: "0 0 10px rgba(255,184,77,0.95)",
                    animation: "blink 1.4s ease-in-out infinite",
                  }}
                />
                <span
                  className="font-mono text-[0.65rem] tracking-[0.2em] uppercase"
                  style={{ color: "rgba(255,210,140,0.92)" }}
                >
                  LED ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* ── Text ── */}
          <div ref={textRef} className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  width: 24,
                  height: 1,
                  background: "rgba(255,180,77,0.7)",
                }}
              />
              <span
                className="font-mono text-[0.63rem] tracking-[0.28em] uppercase"
                style={{ color: "rgba(255,180,77,0.75)" }}
              >
                Système LED intégré
              </span>
            </div>

            <h2
              className="font-black uppercase leading-[0.88] tracking-tight mb-6"
              style={{
                fontSize: "clamp(2.8rem,6.5vw,5.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              <span
                style={{
                  background:
                    "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Un geste.
              </span>
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #ffb84d 0%, #ffd966 50%, #ff9b3d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Elle s&apos;illumine.
              </span>
            </h2>

            <p
              className="leading-[1.75] mb-8"
              style={{ color: "#6a7080", maxWidth: 440, fontSize: "1.02rem" }}
            >
              Un interrupteur sous le socle. Le fuselage s&apos;allume, le cockpit
              aussi — vingt secondes, précisément. Batterie lithium rechargeable
              par USB. Câble de charge inclus.
            </p>

            {/* Spec tiles */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
              style={{ maxWidth: 420 }}
            >
              {SPECS.map((s) => (
                <div
                  key={s.label}
                  className="led-spec flex flex-col gap-1.5 px-4 py-4"
                  style={{
                    borderRadius: "1rem",
                    background: "#0a0a1a",
                    border: "1px solid #1c1c2e",
                  }}
                >
                  <div
                    className="font-mono text-[0.6rem] tracking-[0.18em] uppercase"
                    style={{ color: "#444858" }}
                  >
                    {s.label}
                  </div>
                  <div className="font-bold text-white text-[0.95rem]">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Horizontal rule */}
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to right, rgba(255,180,77,0.5) 0%, transparent 70%)",
                marginBottom: "1.5rem",
              }}
            />

            {/* Large emphasis line */}
            <p
              className="font-black text-white text-center mb-6"
              style={{
                fontSize: "clamp(1.8rem,3.5vw,3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                maxWidth: 440,
              }}
            >
              Un câble USB.<br />Une heure de charge.
            </p>

            <p
              className="font-mono text-[0.63rem] tracking-[0.2em] uppercase"
              style={{ color: "#3a4055" }}
            >
              Câble de charge inclus · Interrupteur sous le socle
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
