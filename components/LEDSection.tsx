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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One-time entry only — no looped pulse/scale on the photo
        gsap.set(imgRef.current, { opacity: 0, x: -50, filter: "blur(10px)" });
        gsap.to(imgRef.current, {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        });

        gsap.set(textRef.current, { opacity: 0, x: 50, filter: "blur(8px)" });
        gsap.to(textRef.current, {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        });

        gsap.set(".led-spec", { opacity: 0, y: 20, scale: 0.92 });
        gsap.to(".led-spec", {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [imgRef.current, textRef.current, ".led-spec"],
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
          "linear-gradient(180deg, #06060f 0%, #0a0604 50%, #06060f 100%)",
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
          style={{ color: "rgba(255,180,77,0.7)", whiteSpace: "nowrap" }}
        >
          LED Cockpit Intégré
        </div>
        <div
          aria-hidden
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }}
        />
      </div>

      {/* Static warm ambient orb (no pulse) */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,180,77,0.25) 0%, rgba(255,140,40,0.08) 40%, transparent 70%)",
          top: "50%",
          left: "25%",
          transform: "translate(-50%, -50%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative py-24 md:py-36">
        <div className="grid gap-14 lg:grid-cols-2 items-center w-full px-6 md:px-12 lg:px-16 max-w-none mx-auto xl:max-w-[1600px]">

          {/* ── Image ── */}
          <div ref={imgRef} className="relative order-2 lg:order-1">
            {/* Static warm glow ring around the frame (no pulse) */}
            <div
              aria-hidden
              className="absolute -inset-3 pointer-events-none"
              style={{
                borderRadius: "2rem",
                boxShadow:
                  "0 0 60px rgba(255,180,77,0.35), 0 0 120px rgba(255,140,40,0.18)",
                opacity: 0.7,
              }}
            />

            {/* Frame */}
            <div
              className="relative overflow-hidden w-full"
              style={{
                borderRadius: "1.75rem",
                aspectRatio: "1/1",
                background: "#0a0604",
                border: "1px solid rgba(255,180,77,0.1)",
              }}
            >
              {/* Real product photo (pre-processed: shadows lifted from
                  10% → 40% mean luminance, blue LEDs swapped to amber via
                  HSV recolor — see scripts/brighten_a220_led.py) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {!imgError ? (
                <img
                  src="/led/a220-on-bright.jpg"
                  alt="Maquette A220 Air France avec LED cabine activé — éclairage intérieur jaune"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  style={{
                    /* Light final polish — most of the work is done in the source */
                    filter: "saturate(1.05) contrast(1.02)",
                  }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(60,30,8,0.9) 0%, rgba(8,4,2,0.98) 100%)",
                  }}
                />
              )}

              {/* Subtle bottom darken to keep "LED ACTIVE" pill readable */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, rgba(4,2,8,0.35) 100%)",
                }}
              />

              {/* LED active badge — static (only the dot blinks subtly) */}
              <div
                className="absolute bottom-5 left-5 flex items-center gap-2.5 px-3.5 py-2"
                style={{
                  borderRadius: 999,
                  background: "rgba(20,10,2,0.85)",
                  border: "1px solid rgba(255,180,77,0.5)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 0 12px rgba(255,140,40,0.2)",
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
