"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";

const PLANE_IMG =
  "https://cdn.shopify.com/s/files/1/0921/9312/8788/files/Airbus_A380_Air_France.png";

/* ── Starfield ──────────────────────────────────────────────────────── */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      c.width = innerWidth;
      c.height = innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.45 + 0.06,
      sp: Math.random() * 0.3 + 0.06,
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    let raf = 0;
    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, c.width, c.height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x * c.width, s.y * c.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,225,255,${s.a * (0.45 + 0.55 * Math.sin(t * s.sp + s.ph))})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

/* ── HeroSection ─────────────────────────────────────────────────────── */
export default function HeroSection() {
  /* ── Refs for GSAP ── */
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const planeWrapRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const marqRef = useRef<HTMLDivElement>(null);

  /* ── Framer Motion: scroll parallax ── */
  const { scrollY } = useScroll();
  const planeScrollY = useTransform(scrollY, [0, 600], [0, -80]);
  const planeScrollOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const glowScrollY = useTransform(scrollY, [0, 600], [0, -32]);

  /* ── Framer Motion: mouse parallax (spring physics) ── */
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const springCfg = { stiffness: 60, damping: 18, mass: 0.8 };
  const planeX = useSpring(rawMouseX, springCfg);
  const planeY = useSpring(rawMouseY, springCfg);
  const glowX = useSpring(useMotionValue(0), { stiffness: 40, damping: 20 });
  const glowY = useSpring(useMotionValue(0), { stiffness: 40, damping: 20 });

  /* Keep glow spring values in sync with plane (at 40% intensity) */
  const glowRawX = useMotionValue(0);
  const glowRawY = useMotionValue(0);
  const glowSpringX = useSpring(glowRawX, { stiffness: 40, damping: 20 });
  const glowSpringY = useSpring(glowRawY, { stiffness: 40, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { innerWidth: W, innerHeight: H } = window;
      const nx = (e.clientX / W - 0.5) * 2; // -1 … 1
      const ny = (e.clientY / H - 0.5) * 2;
      rawMouseX.set(nx * 25);
      rawMouseY.set(ny * 12);
      glowRawX.set(nx * 10);
      glowRawY.set(ny * 6);
    },
    [rawMouseX, rawMouseY, glowRawX, glowRawY],
  );

  /* ── GSAP entry animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(glowRef.current, { opacity: 0, scale: 0.6 });
        gsap.set(planeWrapRef.current, { opacity: 0, x: 60, scale: 0.9 });
        gsap.set(eyebrowRef.current, { opacity: 0, y: 18 });
        gsap.set(line1Ref.current, { opacity: 0, y: 120, skewY: 5 });
        gsap.set(line2Ref.current, { opacity: 0, y: 120, skewY: 5 });
        gsap.set(bodyRef.current, { opacity: 0, y: 28 });
        gsap.set(ctaRef.current, { opacity: 0, y: 22 });
        gsap.set(badgeRef.current, { opacity: 0, x: 28 });
        gsap.set(marqRef.current, { opacity: 0 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl
          .to(glowRef.current, { opacity: 1, scale: 1, duration: 3.2, ease: "power2.out" }, 0)
          .to(planeWrapRef.current, { opacity: 1, x: 0, scale: 1, duration: 1.4, ease: "expo.out" }, 0.2)
          .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 1.0 }, 0.55)
          .to(line1Ref.current, { opacity: 1, y: 0, skewY: 0, duration: 1.6 }, 0.75)
          .to(line2Ref.current, { opacity: 1, y: 0, skewY: 0, duration: 1.6 }, 1.0)
          .to(bodyRef.current, { opacity: 1, y: 0, duration: 1.0 }, 1.35)
          .to(ctaRef.current, { opacity: 1, y: 0, duration: 1.0 }, 1.55)
          .to(badgeRef.current, { opacity: 1, x: 0, duration: 1.0 }, 1.65)
          .to(marqRef.current, { opacity: 1, duration: 0.8 }, 1.9);

        /* Glow pulse */
        gsap.to(glowRef.current, {
          scale: 1.06,
          opacity: 0.9,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 3.5,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            glowRef.current,
            planeWrapRef.current,
            eyebrowRef.current,
            line1Ref.current,
            line2Ref.current,
            bodyRef.current,
            ctaRef.current,
            badgeRef.current,
            marqRef.current,
          ],
          { opacity: 1, y: 0, x: 0, scale: 1, skewY: 0 },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Marquee content ── */
  const marqueeItems = [
    "★ LED intégré",
    "Résine monobloc",
    "Peinture main",
    "Livraison 7–15j",
    "Satisfait ou remboursé 30j",
    "+2000 clients",
    "4.9 / 5",
    "★ LED intégré",
    "Résine monobloc",
    "Peinture main",
    "Livraison 7–15j",
    "Satisfait ou remboursé 30j",
    "+2000 clients",
    "4.9 / 5",
  ];

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#010108" }}
    >
      {/* ── Stars ── */}
      <Starfield />

      {/* ── Grid overlay ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(58,142,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.018) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
        }}
      />

      {/* ── Main two-column layout ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-screen">

        {/* ════════════ LEFT 45% — Headline + Copy + CTA ════════════ */}
        <div
          className="flex flex-col justify-center px-6 md:px-12 xl:px-20 pt-32 pb-16 lg:py-0 w-full lg:w-[45%] shrink-0"
          style={{ zIndex: 10 }}
        >
          {/* Eyebrow */}
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-10">
            <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.5)" }} />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.35em",
                color: "rgba(58,142,255,0.65)",
              }}
            >
              ★ Collection · Résine Premium
            </span>
          </div>

          {/* H1 */}
          <div style={{ maxWidth: 640 }}>
            <div className="overflow-hidden" style={{ marginBottom: "0.02em" }}>
              <div
                ref={line1Ref}
                className="font-black uppercase text-white select-none"
                style={{
                  fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                  fontSize: "clamp(4rem, 8vw, 8.5rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
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
                  fontSize: "clamp(4rem, 8vw, 8.5rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                  color: "transparent",
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.85)",
                }}
              >
                en Résine.
              </div>
            </div>
          </div>

          {/* Sub-headline */}
          <div ref={bodyRef} style={{ marginTop: "2.25rem" }}>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: 400,
                color: "#6b7189",
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
              className="inline-flex items-center gap-3 font-black uppercase text-[#010108]"
              style={{
                fontFamily: "var(--font-space), var(--font-inter), sans-serif",
                fontSize: "0.8rem",
                letterSpacing: "0.14em",
                background: "#ffffff",
                borderRadius: 999,
                padding: "1rem 2rem",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px -10px rgba(58,142,255,0.35)",
                transition:
                  "transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, background 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "#010108";
                el.style.color = "#ffffff";
                el.style.boxShadow =
                  "0 0 0 1px rgba(255,255,255,0.18), 0 20px 60px -12px rgba(58,142,255,0.6), 0 0 40px rgba(58,142,255,0.15)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "#ffffff";
                el.style.color = "#010108";
                el.style.boxShadow =
                  "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px -10px rgba(58,142,255,0.35)";
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
                  <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
                    ★
                  </span>
                ))}
              </div>
              <span
                className="font-black text-white"
                style={{ fontSize: "0.82rem" }}
              >
                4.9
              </span>
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.14em",
                  color: "#2e3545",
                }}
              >
                · +2 000 clients · Retour 30 j
              </span>
            </div>
          </div>
        </div>

        {/* ════════════ RIGHT 55% — Plane + Glow + Badge ════════════ */}
        <div
          className="relative flex items-center justify-center w-full lg:w-[55%]"
          style={{
            minHeight: "clamp(320px, 50vw, 100vh)",
          }}
        >
          {/* Radial glow behind plane — also parallaxes */}
          <motion.div
            ref={glowRef}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              x: glowSpringX,
              y: glowSpringY,
              translateY: glowScrollY,
            }}
          >
            {/* Main directional glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 70% 60% at 70% 50%, rgba(30,80,200,0.25), transparent)",
              }}
            />
            {/* Secondary soft bloom */}
            <div
              style={{
                position: "absolute",
                top: "15%",
                right: "-5%",
                width: "70%",
                height: "70%",
                background:
                  "radial-gradient(ellipse, rgba(40,90,240,0.18) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />
            {/* Bottom fill */}
            <div
              style={{
                position: "absolute",
                bottom: "-10%",
                left: "20%",
                width: "60%",
                height: "55%",
                background:
                  "radial-gradient(ellipse, rgba(20,55,180,0.22) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
          </motion.div>

          {/* Badge — floating glass-morphism pill */}
          <div
            ref={badgeRef}
            className="absolute top-[18%] right-[8%] z-20 flex flex-col gap-2 items-end"
          >
            {/* Bestseller dot */}
            <div
              className="flex items-center gap-2 px-3 py-1.5"
              style={{
                borderRadius: 999,
                background: "rgba(4,4,20,0.72)",
                border: "1px solid rgba(58,142,255,0.3)",
                backdropFilter: "blur(16px)",
              }}
            >
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: "#3a8eff",
                  boxShadow: "0 0 8px rgba(58,142,255,1)",
                  animation: "blink 2s ease-in-out infinite",
                }}
              />
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: "0.57rem",
                  letterSpacing: "0.22em",
                  color: "rgba(100,165,255,0.88)",
                }}
              >
                Bestseller · +2 000 vendus
              </span>
            </div>

            {/* Price pill */}
            <div
              className="px-4 py-3 text-right"
              style={{
                borderRadius: "0.875rem",
                background: "rgba(4,4,20,0.62)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(18px)",
              }}
            >
              <div
                className="font-mono uppercase mb-0.5"
                style={{
                  fontSize: "0.53rem",
                  letterSpacing: "0.22em",
                  color: "#3a4055",
                }}
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
          </div>

          {/* ── Plane image — float + mouse + scroll parallax ── */}
          <motion.div
            ref={planeWrapRef}
            style={{
              x: planeX,
              y: planeY,
              translateY: planeScrollY,
              opacity: planeScrollOpacity,
              position: "relative",
              zIndex: 10,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* float keyframe via CSS animation */}
            <div
              aria-hidden
              style={{
                animation: "heroFloat 4s ease-in-out infinite",
                willChange: "transform",
                filter: "drop-shadow(0 0 60px rgba(30,80,200,0.35)) drop-shadow(0 30px 80px rgba(0,0,30,0.6))",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PLANE_IMG}
                alt="Airbus A380 Air France — maquette résine"
                style={{
                  width: "clamp(320px, 56vw, 820px)",
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom marquee strip ── */}
      <div ref={marqRef} className="relative z-10">
        <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
        <div
          className="overflow-hidden py-3.5"
          style={{
            background: "rgba(1,1,8,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="marquee-track">
            {marqueeItems.map((item, i) => (
              <span
                key={i}
                className="font-mono uppercase shrink-0"
                style={{
                  fontSize: "0.57rem",
                  letterSpacing: "0.24em",
                  color: "rgba(255,255,255,0.2)",
                  margin: "0 2rem",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Inline keyframe for plane float ── */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}
