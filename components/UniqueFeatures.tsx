"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    hud: "MAT-01", icon: "◈",
    title: "Résine monobloc",
    body: "Coulée sous pression, immuable. 47 cm de présence dans n'importe quel espace. Socle bois massif inclus. Une pièce pensée pour traverser le temps — pas une maquette de salon.",
    stat: "47", statUnit: "cm", statLabel: "Format",
    accent: "rgba(58,142,255,0.07)",
    span: "col-span-1 md:col-span-1 lg:col-span-2", large: true,
  },
  {
    hud: "LED-20S", icon: "◉",
    title: "La lumière sur commande",
    body: "Un interrupteur sous le socle. Le fuselage et le cockpit s'allument — vingt secondes de lumière pure. La conversation commence, sans un mot.",
    stat: "20", statUnit: "s", statLabel: "Illumination",
    accent: "rgba(58,142,255,0.1)",
    span: "col-span-1", large: false,
  },
  {
    hud: "SCL-147", icon: "◇",
    title: "Échelle 1/147",
    body: "Chaque rivet, chaque livrée reproduits avec exactitude. Peinture main, train amovible. Emballage premium — prête à offrir dès réception.",
    stat: "1/147", statUnit: "", statLabel: "Précision",
    accent: "rgba(40,100,220,0.07)",
    span: "col-span-1", large: false,
  },
];

export default function UniqueFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(headingRef.current, { opacity: 0, y: 70, filter: "blur(10px)" });
        gsap.to(headingRef.current,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: headingRef.current, start: "top 88%" } }
        );

        gsap.utils.toArray<HTMLElement>(".feat-card").forEach((card, i) => {
          gsap.set(card, { opacity: 0, y: 100, scale: 0.84, filter: "blur(14px)" });
          gsap.to(card,
            {
              opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
              duration: 1.1, ease: "expo.out",
              delay: i * 0.14,
              scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none none" },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>(".feat-stat").forEach((stat) => {
          gsap.set(stat, { opacity: 0, scale: 0.35, y: 24 });
          gsap.to(stat,
            {
              opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(2.8)",
              scrollTrigger: { trigger: stat, start: "top 90%" },
            }
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".feat-card", { opacity: 1, y: 0, scale: 1, filter: "none" });
        gsap.set(".feat-stat", { opacity: 1, scale: 1, y: 0 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: "#07071a", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 55% at 85% 50%, rgba(18,50,160,0.08) 0%, transparent 65%)",
      }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(58,142,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(58,142,255,0.015) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div ref={headingRef} className="mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 24, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span className="font-mono text-[0.63rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
              Savoir-faire
            </span>
          </div>
          <h2 className="font-black uppercase leading-[0.9] tracking-tight"
            style={{
              fontSize: "clamp(2.4rem,5.5vw,4.5rem)",
              letterSpacing: "-0.02em",
              background: "linear-gradient(125deg, #e0e4ea 0%, #ffffff 45%, #b0b8c8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            L&apos;obsession<br />du détail.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {FEATURES.map((f) => (
            <div key={f.hud}
              className={`feat-card relative flex flex-col overflow-hidden ${f.span}`}
              style={{
                borderRadius: "1.5rem",
                background: "#0c0c1a",
                border: "1px solid #1c1c2e",
                padding: "1.75rem",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.border = "1px solid rgba(58,142,255,0.22)";
                el.style.boxShadow = "0 20px 60px -20px rgba(58,142,255,0.18)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.border = "1px solid #1c1c2e";
                el.style.boxShadow = "none";
              }}
            >
              <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
                borderRadius: "inherit",
                background: `radial-gradient(280px 200px at 20% 20%, ${f.accent}, transparent 70%)`,
              }} />

              <div className="relative flex items-start justify-between mb-5">
                <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: "rgba(58,142,255,0.55)" }}>
                  {f.hud}
                </span>
                <span style={{ color: "rgba(58,142,255,0.4)", fontSize: "1.1rem" }} aria-hidden>{f.icon}</span>
              </div>

              <div className={`feat-stat relative font-black leading-none ${f.large ? "text-[4.5rem] md:text-[5.5rem]" : "text-[3.5rem]"}`}
                style={{
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(135deg, #ffffff 0%, #c0c8d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                {f.stat}
                {f.statUnit && (
                  <span style={{ fontSize: "0.42em", opacity: 0.55, fontWeight: 500, fontFamily: "monospace", verticalAlign: "top", marginTop: "0.5em", marginLeft: "0.2em" }}>
                    {f.statUnit}
                  </span>
                )}
              </div>
              <div className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mt-1 mb-5" style={{ color: "#3a4055" }}>
                {f.statLabel}
              </div>

              <div style={{ height: 1, background: "linear-gradient(to right, rgba(58,142,255,0.2), rgba(58,142,255,0.05), transparent)", marginBottom: "1.25rem" }} />

              <h3 className="font-bold text-white text-[0.88rem] uppercase tracking-wide mb-2">{f.title}</h3>
              <p className="text-[0.8rem] leading-relaxed flex-1" style={{ color: "#565870" }}>{f.body}</p>

              <div className="flex items-center gap-2 mt-5">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#3a8eff", boxShadow: "0 0 6px rgba(58,142,255,0.8)", animation: "blink 2s infinite" }} />
                <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "#2a3040" }}>ACTIF</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
