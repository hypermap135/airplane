"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 2000, suffix: "+",  label: "Passionnés",    hud: "CLI" },
  { value: 4.9,  suffix: "/5", label: "Note moyenne",  hud: "RTG", decimals: 1 },
  { value: 26,   suffix: "",   label: "Modèles",       hud: "CAT" },
  { value: 30,   suffix: "j",  label: "Retour libre",  hud: "SVC" },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Line sweeps in */
        gsap.set(lineRef.current, { scaleX: 0 });
        gsap.to(lineRef.current,
          { scaleX: 1, duration: 1.4, ease: "expo.inOut",
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%" } }
        );

        /* Stats pop up */
        gsap.set(".stat-item", { opacity: 0, y: 60, filter: "blur(10px)" });
        gsap.to(".stat-item",
          {
            opacity: 1, y: 0, filter: "blur(0px)",
            stagger: 0.1, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
          }
        );

        /* Counters */
        STATS.forEach((stat, i) => {
          const el = document.querySelector<HTMLElement>(`.stat-val-${i}`);
          if (!el) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: stat.value,
            duration: 2.4,
            ease: "power2.out",
            delay: i * 0.1,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
            onUpdate: () => {
              const d = stat.decimals ?? 0;
              const v = d > 0
                ? obj.val.toFixed(d).replace(".", ",")
                : Math.round(obj.val).toLocaleString("fr-FR");
              el.textContent = v + stat.suffix;
            },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".stat-item", { opacity: 1, y: 0, filter: "none" });
        gsap.set(lineRef.current, { scaleX: 1 });
        STATS.forEach((stat, i) => {
          const el = document.querySelector<HTMLElement>(`.stat-val-${i}`);
          if (!el) return;
          const d = stat.decimals ?? 0;
          const v = d > 0
            ? stat.value.toFixed(d).replace(".", ",")
            : stat.value.toLocaleString("fr-FR");
          el.textContent = v + stat.suffix;
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#040410", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(18,50,160,0.08) 0%, transparent 70%)",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        {/* Top divider */}
        <div ref={lineRef} className="mb-16 origin-left" style={{
          height: 1,
          background: "linear-gradient(to right, rgba(58,142,255,0.5) 0%, rgba(58,142,255,0.1) 60%, transparent 100%)",
        }} />

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <div key={stat.hud} className="stat-item relative">
              {/* Divider between items (desktop) */}
              {i > 0 && (
                <div className="hidden md:block absolute -left-2 top-4 bottom-4 w-px"
                  style={{ background: "rgba(255,255,255,0.07)" }} />
              )}
              <div className="font-mono text-[0.6rem] tracking-[0.24em] uppercase mb-3"
                style={{ color: "rgba(58,142,255,0.5)" }}>
                {stat.hud}
              </div>
              <div
                className={`stat-val-${i} font-black leading-none tracking-tight`}
                style={{
                  fontSize: "clamp(2.8rem,6vw,5.2rem)",
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #ffffff 0%, #c0c8d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                0{stat.suffix}
              </div>
              <p className="mt-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase"
                style={{ color: "#444858" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
