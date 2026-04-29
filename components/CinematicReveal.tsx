"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CinematicReveal() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pin = pinRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;
    const eyebrow = eyebrowRef.current;
    const headline = headlineRef.current;
    const specs = specsRef.current;

    if (!wrapper || !pin || !image || !glow || !eyebrow || !headline || !specs) return;

    const ctx = gsap.context(() => {
      // Pin the inner container while scrolling through the tall wrapper
      ScrollTrigger.create({
        trigger: wrapper,
        pin: pin,
        start: "top top",
        end: "+=80%",
        scrub: 1,
      });

      // Image scale + blur + opacity reveal
      gsap.fromTo(
        image,
        { scale: 0.65, filter: "blur(8px)", opacity: 0.4 },
        {
          scale: 1,
          filter: "blur(0px)",
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "+=80%",
            scrub: 1.5,
          },
        }
      );

      // Glow expansion
      gsap.fromTo(
        glow,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1.4,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "+=80%",
            scrub: 1.5,
          },
        }
      );

      // Text overlay — appears after 40% scroll progress
      gsap.fromTo(
        [eyebrow, headline, specs],
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            // 40% of the 80% end = 32% into the 180vh wrapper
            start: "32% top",
            end: "+=40%",
            scrub: 1,
          },
        }
      );
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        background: "#06060f",
        width: "100%",
        height: "180vh",
        position: "relative",
      }}
    >
      {/* Pinned viewport-height container */}
      <div
        ref={pinRef}
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow behind the plane */}
        <div
          ref={glowRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              width: "60vw",
              height: "38vh",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(58,142,255,0.22) 0%, rgba(58,80,200,0.1) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Plane image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src="https://cdn.shopify.com/s/files/1/0921/9312/8788/files/Airbus_A350_Air_France.png"
          alt="Airbus A350 Air France — maquette résine"
          style={{
            position: "relative",
            zIndex: 1,
            width: "min(880px, 90vw)",
            maxWidth: "90vw",
            height: "auto",
            objectFit: "contain",
            willChange: "transform, filter, opacity",
            display: "block",
          }}
        />

        {/* Text overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "clamp(2.5rem, 6vh, 5rem)",
            gap: "1rem",
            pointerEvents: "none",
          }}
        >
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(140,190,255,0.7)",
              opacity: 0,
            }}
          >
            Résine coulée sous pression
          </div>

          {/* Headline */}
          <div
            ref={headlineRef}
            style={{
              fontSize: "clamp(1.35rem, 3.5vw, 2.6rem)",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              opacity: 0,
              maxWidth: "700px",
              padding: "0 1.5rem",
            }}
          >
            Chaque rivet. Chaque courbe.&nbsp;À la perfection.
          </div>

          {/* Specs row */}
          <div
            ref={specsRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(1.2rem, 3vw, 2.5rem)",
              opacity: 0,
            }}
          >
            {[
              { value: "1/147e", label: "Échelle" },
              { value: "47 cm", label: "Envergure" },
              { value: "LED intégré", label: "Éclairage" },
            ].map((spec, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(1.2rem, 3vw, 2.5rem)" }}>
                {i > 0 && (
                  <span
                    aria-hidden
                    style={{ color: "rgba(58,142,255,0.3)", fontSize: "1.1rem", lineHeight: 1 }}
                  >
                    ·
                  </span>
                )}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "clamp(0.9rem, 1.8vw, 1.15rem)",
                      fontWeight: 700,
                      color: "rgba(140,190,255,0.95)",
                      fontFamily: "var(--font-mono, monospace)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {spec.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      marginTop: "0.2rem",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    {spec.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top-edge vignette */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "18vh",
            background: "linear-gradient(to bottom, #06060f 0%, transparent 100%)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        {/* Bottom-edge vignette */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "18vh",
            background: "linear-gradient(to top, #06060f 0%, transparent 100%)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
