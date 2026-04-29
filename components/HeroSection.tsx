"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

/* ── Starfield ─────────────────────────────────────────────────── */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.1 + 0.1,
      a: Math.random() * 0.4 + 0.05,
      sp: Math.random() * 0.3 + 0.06,
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, raf = 0;
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
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

/* ── HeroSection ───────────────────────────────────────────────── */
export default function HeroSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const glowRef     = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const line1Ref    = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLDivElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const marqRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(glowRef.current,    { opacity: 0, scale: 0.7 });
        gsap.set(eyebrowRef.current, { opacity: 0, y: 16 });
        gsap.set(line1Ref.current,   { opacity: 0, y: 110, skewY: 5 });
        gsap.set(line2Ref.current,   { opacity: 0, y: 110, skewY: 5 });
        gsap.set(bodyRef.current,    { opacity: 0, y: 26 });
        gsap.set(ctaRef.current,     { opacity: 0, y: 20 });
        gsap.set(badgeRef.current,   { opacity: 0, x: 24 });
        gsap.set(marqRef.current,    { opacity: 0 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl
          .to(glowRef.current,    { opacity: 1, scale: 1, duration: 3.2, ease: "power2.out" }, 0)
          .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 1.0 }, 0.5)
          .to(line1Ref.current,   { opacity: 1, y: 0, skewY: 0, duration: 1.6 }, 0.75)
          .to(line2Ref.current,   { opacity: 1, y: 0, skewY: 0, duration: 1.6 }, 1.0)
          .to(bodyRef.current,    { opacity: 1, y: 0, duration: 1.0 }, 1.35)
          .to(ctaRef.current,     { opacity: 1, y: 0, duration: 1.0 }, 1.55)
          .to(badgeRef.current,   { opacity: 1, x: 0, duration: 1.0 }, 1.65)
          .to(marqRef.current,    { opacity: 1, duration: 0.8 }, 1.9);

        /* glow pulse */
        gsap.to(glowRef.current, {
          scale: 1.08, opacity: 0.85,
          duration: 4, ease: "sine.inOut",
          repeat: -1, yoyo: true,
          delay: 3.5,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([glowRef.current, eyebrowRef.current, line1Ref.current, line2Ref.current,
          bodyRef.current, ctaRef.current, badgeRef.current, marqRef.current],
          { opacity: 1, y: 0, x: 0, scale: 1, skewY: 0 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#010108" }}
    >
      {/* ── Stars ──────────────────────────────────────────────── */}
      <Starfield />

      {/* ── Atmospheric glow layers ────────────────────────────── */}
      <div ref={glowRef} aria-hidden className="absolute inset-0 pointer-events-none z-[1]">
        {/* Main blue nebula — bottom center */}
        <div className="absolute" style={{
          bottom: "-10%", left: "50%", transform: "translateX(-50%)",
          width: "90%", height: "60%",
          background: "radial-gradient(ellipse, rgba(40,100,255,0.55) 0%, rgba(20,60,200,0.2) 40%, transparent 72%)",
          filter: "blur(60px)",
        }} />
        {/* Secondary blue — right */}
        <div className="absolute" style={{
          top: "20%", right: "-5%",
          width: "50%", height: "50%",
          background: "radial-gradient(ellipse, rgba(30,70,220,0.22) 0%, transparent 68%)",
          filter: "blur(80px)",
        }} />
        {/* Subtle warm accent — left */}
        <div className="absolute" style={{
          top: "30%", left: "-5%",
          width: "35%", height: "40%",
          background: "radial-gradient(ellipse, rgba(15,30,120,0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      {/* ── Subtle grid overlay ────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-[2]" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.022) 1px, transparent 1px)",
        backgroundSize: "90px 90px",
      }} />

      {/* ── Badge (top right) ──────────────────────────────────── */}
      <div ref={badgeRef} className="absolute top-28 right-5 md:right-10 xl:right-16 z-10 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5"
          style={{
            borderRadius: 999,
            background: "rgba(4,4,20,0.7)",
            border: "1px solid rgba(58,142,255,0.28)",
            backdropFilter: "blur(14px)",
          }}>
          <span aria-hidden className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "#3a8eff", boxShadow: "0 0 8px rgba(58,142,255,1)", animation: "blink 2s ease-in-out infinite" }} />
          <span className="font-mono text-[0.57rem] tracking-[0.22em] uppercase" style={{ color: "rgba(100,165,255,0.85)" }}>
            Bestseller · +2 000 vendus
          </span>
        </div>
        <div className="px-4 py-3 text-right"
          style={{
            borderRadius: "0.875rem",
            background: "rgba(4,4,20,0.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
          }}>
          <div className="font-mono text-[0.53rem] tracking-[0.22em] uppercase mb-0.5" style={{ color: "#3a4055" }}>
            À partir de
          </div>
          <div className="font-black text-white leading-none" style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}>
            89€
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 py-40 lg:py-0">

          {/* Eyebrow */}
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-10 md:mb-14">
            <div style={{ width: 32, height: 1, background: "rgba(58,142,255,0.5)" }} />
            <span className="font-mono text-[0.6rem] tracking-[0.32em] uppercase"
              style={{ color: "rgba(58,142,255,0.6)" }}>
              Résine coulée · LED intégré · Paris
            </span>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: "min(100%, 980px)" }}>
            <div className="overflow-hidden" style={{ marginBottom: "0.05em" }}>
              <div
                ref={line1Ref}
                className="font-black uppercase text-white select-none"
                style={{
                  fontSize: "clamp(4.8rem,14vw,13rem)",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.82,
                }}
              >
                L&apos;AVION
              </div>
            </div>
            <div className="overflow-hidden">
              <div
                ref={line2Ref}
                className="font-black uppercase select-none"
                style={{
                  fontSize: "clamp(4.8rem,14vw,13rem)",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.82,
                  background: "linear-gradient(110deg, #9aaabb 0%, #dde4ea 28%, #ffffff 48%, #ccd4dc 72%, #8898a8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CHEZ VOUS.
              </div>
            </div>
          </div>

          {/* Body + CTA */}
          <div className="mt-14 md:mt-18 flex flex-col sm:flex-row sm:items-end gap-10 md:gap-16">

            <div ref={bodyRef}>
              <p className="text-[0.9rem] leading-[1.9]" style={{ color: "#4a5262", maxWidth: 300 }}>
                Résine monobloc. Peinte à la main.<br />
                LED intégré — 20 secondes de lumière.<br />
                Une sculpture, pas une maquette.
              </p>
            </div>

            <div ref={ctaRef} className="flex flex-col gap-5 shrink-0">
              <Link href="/collections/all" className="btn-chrome">
                Voir la collection →
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.82rem" }}>★</span>
                  ))}
                </div>
                <span className="font-bold text-white text-[0.82rem]">4.9</span>
                <span className="font-mono text-[0.56rem] tracking-[0.12em] uppercase" style={{ color: "#2e3545" }}>
                  · +2 000 clients · Retour 30 j
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom marquee ─────────────────────────────────────── */}
      <div ref={marqRef} className="relative z-10 mt-auto">
        <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
        <div className="overflow-hidden py-3.5"
          style={{ background: "rgba(1,1,8,0.55)", backdropFilter: "blur(8px)" }}>
          <div className="marquee-track">
            {[
              "Résine monobloc", "LED intégré USB", "Peinture à la main",
              "Échelle 1/147", "Socle bois massif", "47 cm · 1,3 kg",
              "Livraison suivie", "Satisfait ou remboursé 30 j",
              "Résine monobloc", "LED intégré USB", "Peinture à la main",
              "Échelle 1/147", "Socle bois massif", "47 cm · 1,3 kg",
              "Livraison suivie", "Satisfait ou remboursé 30 j",
            ].map((s, i) => (
              <span key={i}
                className="font-mono text-[0.57rem] tracking-[0.24em] uppercase shrink-0"
                style={{ color: "rgba(255,255,255,0.2)", margin: "0 2rem" }}>
                {i % 8 === 0
                  ? <><span aria-hidden style={{ color: "rgba(58,142,255,0.4)", marginRight: "2rem" }}>✦</span>{s}</>
                  : s}
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
