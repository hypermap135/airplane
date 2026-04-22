"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PLANE_URL =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2400&q=90&fit=crop";

const SPECS = [
  "Résine monobloc", "Peinture main", "LED intégré", "Échelle 1/147",
  "Socle bois massif", "47 cm", "1,3 kg", "Satisfait ou remboursé 30 j",
];

/* ── Starfield ─────────────────────────────────────────────────── */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.5 + 0.08,
      sp: Math.random() * 0.4 + 0.1,
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, id = 0;
    const draw = () => {
      t += 0.005; ctx.clearRect(0, 0, c.width, c.height);
      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.sin(t * s.sp + s.ph);
        ctx.beginPath();
        ctx.arc(s.x * c.width + mx * 20, s.y * c.height + my * 12, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190,215,255,${s.a * tw})`;
        ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── HeroSection ── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef    = useRef<HTMLDivElement>(null);
  const rightRef   = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1Ref   = useRef<HTMLDivElement>(null);
  const line2Ref   = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const glowRef    = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const marqRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Set initial states INSIDE effect — not in JSX */
        gsap.set([eyebrowRef.current, ctaRef.current, statsRef.current, scrollRef.current, marqRef.current],
          { opacity: 0 });
        gsap.set([line1Ref.current, line2Ref.current],
          { opacity: 0, y: 80, skewY: 4 });
        gsap.set(rightRef.current, { opacity: 0, scale: 1.05, filter: "blur(24px)" });
        gsap.set(glowRef.current, { opacity: 0, scale: 0.85 });

        /* Load-in */
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(eyebrowRef.current,
            { opacity: 1, duration: 0.9 }
          )
          .to(line1Ref.current,
            { opacity: 1, y: 0, skewY: 0, duration: 1.4 }, "-=0.5"
          )
          .to(line2Ref.current,
            { opacity: 1, y: 0, skewY: 0, duration: 1.4 }, "-=1.1"
          )
          .to(rightRef.current,
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2.2, ease: "expo.inOut" }, 0.15
          )
          .to(glowRef.current,
            { opacity: 1, scale: 1, duration: 2.6, ease: "power2.out" }, 0.4
          )
          .to(ctaRef.current,
            { opacity: 1, duration: 0.9 }, "-=1.2"
          )
          .to(statsRef.current,
            { opacity: 1, duration: 0.8 }, "-=0.7"
          )
          .to([scrollRef.current, marqRef.current],
            { opacity: 1, duration: 0.7, stagger: 0.1 }, "-=0.5"
          );

        /* Parallax */
        gsap.to(rightRef.current, {
          yPercent: -18, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 1.4 },
        });
        gsap.to(leftRef.current, {
          yPercent: -6, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 2 },
        });
        gsap.to(glowRef.current, {
          scale: 1.25, opacity: 0.5, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 1.8 },
        });
      });

      /* No animation — elements already visible (no opacity:0 in JSX) */
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden" style={{ background: "#010108" }}>
      <Starfield />

      {/* Ambient */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 90% 60% at 75% 40%, rgba(18,50,160,0.14) 0%, transparent 65%)",
        }} />
      </div>

      <div className="relative w-full min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] min-h-screen items-center">

            {/* LEFT */}
            <div ref={leftRef} className="relative z-10 py-32 lg:py-0 pr-0 lg:pr-16">

              {/* Eyebrow */}
              <div ref={eyebrowRef} className="flex items-center gap-3 mb-10 md:mb-16">
                <div style={{ width: 28, height: 1, background: "rgba(58,142,255,0.6)" }} />
                <span className="font-mono text-[0.62rem] tracking-[0.3em] uppercase"
                  style={{ color: "rgba(58,142,255,0.65)" }}>
                  Maquettes d&apos;avion · Paris
                </span>
              </div>

              {/* Headline */}
              <div className="overflow-hidden mb-0.5">
                <div ref={line1Ref}
                  className="font-black uppercase leading-[0.86] text-white select-none"
                  style={{ fontSize: "clamp(4.2rem,11.5vw,10rem)", letterSpacing: "-0.03em" }}>
                  Maquettes
                </div>
              </div>
              <div className="overflow-hidden">
                <div ref={line2Ref}
                  className="font-black uppercase leading-[0.86] select-none"
                  style={{
                    fontSize: "clamp(4.2rem,11.5vw,10rem)",
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(125deg, #c0c8d4 0%, #ffffff 45%, #9ea8b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                  d&apos;exception
                </div>
              </div>

              {/* CTAs */}
              <div ref={ctaRef} className="mt-10 md:mt-14 flex flex-wrap gap-4">
                <Link href="/collections/all" className="btn-chrome">
                  Découvrir →
                </Link>
                <Link href="/collections/packs" className="btn-ghost">
                  Packs & offres
                </Link>
              </div>

              {/* Stats — tighter, fewer */}
              <div ref={statsRef} className="mt-12 md:mt-16 flex items-center gap-8 md:gap-12">
                {[
                  { val: "+2000", label: "Clients" },
                  { val: "4.9★", label: "Note" },
                  { val: "30 j", label: "Retour" },
                ].map((s, i) => (
                  <div key={i} className="relative">
                    {i > 0 && (
                      <div className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-px h-5"
                        style={{ background: "rgba(255,255,255,0.09)" }} />
                    )}
                    <div className="text-white font-bold whitespace-nowrap" style={{ fontSize: "1.3rem" }}>{s.val}</div>
                    <div className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mt-0.5"
                      style={{ color: "#3a4055" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Plane */}
            <div ref={rightRef} className="relative h-[60vw] lg:h-screen lg:max-h-[1000px]">
              <div ref={glowRef} aria-hidden className="absolute pointer-events-none" style={{
                width: "90%", height: "60%", left: "5%", bottom: "15%",
                background: "radial-gradient(ellipse, rgba(58,142,255,0.22) 0%, rgba(30,80,220,0.07) 45%, transparent 72%)",
                filter: "blur(55px)",
              }} />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PLANE_URL}
                alt="Maquette d'avion en vol"
                className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
                draggable={false}
                referrerPolicy="no-referrer"
                style={{ mixBlendMode: "screen", filter: "brightness(2.6) contrast(1.3) saturate(0.06)" }}
              />

              <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
                background: [
                  "linear-gradient(to right, #010108 0%, rgba(1,1,8,0.65) 18%, rgba(1,1,8,0.15) 40%, transparent 60%)",
                  "linear-gradient(to bottom, rgba(1,1,8,0.5) 0%, transparent 18%, transparent 72%, #010108 100%)",
                  "linear-gradient(to left, rgba(1,1,8,0.35) 0%, transparent 30%)",
                ].join(", "),
              }} />

              {/* HUD corner */}
              <div aria-hidden className="absolute top-[18%] right-[8%] pointer-events-none" style={{ opacity: 0.35 }}>
                <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                  <path d="M2 14 L2 2 L14 2" stroke="rgba(58,142,255,0.8)" strokeWidth="1.5"/>
                  <path d="M34 2 L46 2 L46 14" stroke="rgba(58,142,255,0.8)" strokeWidth="1.5"/>
                  <path d="M46 34 L46 46 L34 46" stroke="rgba(58,142,255,0.8)" strokeWidth="1.5"/>
                  <path d="M14 46 L2 46 L2 34" stroke="rgba(58,142,255,0.8)" strokeWidth="1.5"/>
                </svg>
              </div>
              <div aria-hidden className="absolute bottom-[22%] left-[8%] font-mono text-[0.58rem] tracking-[0.22em] pointer-events-none"
                style={{ color: "rgba(58,142,255,0.4)" }}>
                ÉCHELLE 1/147
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-[0.52rem] tracking-[0.45em] uppercase" style={{ color: "rgba(255,255,255,0.15)" }}>
          scroll
        </span>
        <div className="relative overflow-hidden" style={{ width: 1, height: 52, background: "rgba(255,255,255,0.06)" }}>
          <div className="absolute top-0 left-0 w-full" style={{
            height: "50%",
            background: "linear-gradient(to bottom, transparent, rgba(58,142,255,0.7))",
            animation: "scrollBounce 2s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* Specs marquee */}
      <div ref={marqRef} className="absolute bottom-0 left-0 right-0">
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
        <div className="overflow-hidden py-3">
          <div className="marquee-track">
            {[...SPECS, ...SPECS, ...SPECS].map((s, i) => (
              <span key={i} className="font-mono text-[0.58rem] tracking-[0.24em] uppercase shrink-0"
                style={{ color: "rgba(255,255,255,0.14)", margin: "0 2rem" }}>
                {i % SPECS.length === 0
                  ? <><span style={{ color: "rgba(58,142,255,0.35)", marginRight: "2rem" }}>✦</span>{s}</>
                  : s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
