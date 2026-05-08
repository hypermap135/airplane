"use client";

import { useRef, useEffect } from "react";
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

            {/* Frame — pure SVG illustration, no photo, no blue */}
            <div
              className="relative overflow-hidden w-full flex items-center justify-center"
              style={{
                borderRadius: "1.75rem",
                aspectRatio: "1/1",
                background:
                  "radial-gradient(ellipse 70% 55% at 50% 50%, #1a0e02 0%, #0a0604 50%, #050302 100%)",
              }}
            >
              {/* Warm ambient halo behind plane */}
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  width: "70%",
                  height: "30%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse 100% 100%, rgba(255,180,77,0.28) 0%, rgba(255,140,40,0.10) 50%, transparent 80%)",
                  filter: "blur(20px)",
                  animation: "ledHalo 3.5s ease-in-out infinite",
                }}
              />

              {/* Airplane silhouette + lit windows (side view) */}
              <svg
                viewBox="0 0 800 220"
                className="relative w-[88%] h-auto"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(255,180,77,0.45))",
                }}
                aria-label="Avion avec LED cabine allumée"
              >
                <defs>
                  <linearGradient id="led-fuselage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1c1c24" />
                    <stop offset="50%" stopColor="#0e0e14" />
                    <stop offset="100%" stopColor="#08080c" />
                  </linearGradient>
                  <linearGradient id="led-wing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14141c" />
                    <stop offset="100%" stopColor="#06060a" />
                  </linearGradient>
                  <radialGradient id="led-window-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff4c2" stopOpacity="1" />
                    <stop offset="40%" stopColor="#ffd966" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#ff9b3d" stopOpacity="0.4" />
                  </radialGradient>
                </defs>

                {/* Tail vertical fin */}
                <path
                  d="M 60 110 L 50 50 Q 50 45 56 45 L 90 45 Q 96 45 96 50 L 110 110 Z"
                  fill="url(#led-fuselage)"
                />

                {/* Horizontal stabilizer */}
                <path
                  d="M 70 100 L 30 95 L 30 110 L 70 115 Z"
                  fill="url(#led-wing)"
                />

                {/* Wing under fuselage */}
                <path
                  d="M 320 130 L 360 175 L 530 175 L 580 130 Z"
                  fill="url(#led-wing)"
                />
                <path
                  d="M 370 175 L 365 195 L 380 195 L 385 175 Z M 480 175 L 475 195 L 490 195 L 495 175 Z"
                  fill="#0a0a10"
                />

                {/* Fuselage body — long rounded shape */}
                <path
                  d="M 100 100
                     L 690 100
                     Q 740 100 760 115
                     Q 770 122 762 130
                     Q 740 140 690 140
                     L 100 140
                     Q 90 140 90 130
                     L 90 110
                     Q 90 100 100 100 Z"
                  fill="url(#led-fuselage)"
                  stroke="rgba(255,180,77,0.08)"
                  strokeWidth="0.5"
                />

                {/* Cockpit nose — slightly darker tip with cockpit window hint */}
                <path
                  d="M 690 105 L 745 115 Q 752 120 745 125 L 690 135 Z"
                  fill="#050508"
                />
                <ellipse cx="710" cy="118" rx="6" ry="3" fill="#ffd966" opacity="0.35" />

                {/* Engine under wing */}
                <ellipse cx="430" cy="150" rx="22" ry="9" fill="#0a0a10" />
                <ellipse cx="430" cy="150" rx="22" ry="9" fill="none" stroke="rgba(255,180,77,0.12)" strokeWidth="0.5" />

                {/* Cabin windows — row of glowing yellow */}
                {Array.from({ length: 32 }).map((_, i) => {
                  const x = 130 + i * 17;
                  return (
                    <g key={i}>
                      {/* Outer halo */}
                      <ellipse
                        cx={x + 5}
                        cy={120}
                        rx="6"
                        ry="4"
                        fill="url(#led-window-glow)"
                        opacity={0.6 + (i % 3) * 0.15}
                      >
                        <animate
                          attributeName="opacity"
                          values={`${0.55 + (i % 3) * 0.1};${0.85 + (i % 3) * 0.05};${0.55 + (i % 3) * 0.1}`}
                          dur={`${3 + (i % 4) * 0.4}s`}
                          repeatCount="indefinite"
                        />
                      </ellipse>
                      {/* Crisp window rectangle */}
                      <rect
                        x={x + 2}
                        y={117}
                        width="6"
                        height="6"
                        rx="1.5"
                        fill="#fff2b8"
                      />
                    </g>
                  );
                })}

                {/* Cargo door / detail line */}
                <line
                  x1="120"
                  y1="135"
                  x2="680"
                  y2="135"
                  stroke="rgba(255,180,77,0.05)"
                  strokeWidth="0.5"
                />
              </svg>

              {/* LED active badge — amber, no animation noise */}
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
