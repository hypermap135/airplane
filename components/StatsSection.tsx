"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  {
    display: "2 000+",
    value: 2000,
    suffix: "+",
    label: "Passionnés",
    decimals: 0,
    formatFn: (v: number) => Math.round(v).toLocaleString("fr-FR") + "+",
  },
  {
    display: "4,9/5",
    value: 4.9,
    suffix: "/5",
    label: "Note moyenne",
    decimals: 1,
    formatFn: (v: number) => v.toFixed(1).replace(".", ",") + "/5",
  },
  {
    display: "26",
    value: 26,
    suffix: "",
    label: "Modèles",
    decimals: 0,
    formatFn: (v: number) => String(Math.round(v)),
  },
  {
    display: "30j",
    value: 30,
    suffix: "j",
    label: "Retour libre",
    decimals: 0,
    formatFn: (v: number) => String(Math.round(v)) + "j",
  },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Stat items slide up */
        gsap.set(".stat-item", { opacity: 0, y: 40, filter: "blur(6px)" });
        gsap.to(".stat-item", {
          opacity: 1, y: 0, filter: "blur(0px)",
          stagger: 0.1, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        });

        /* Animated counters */
        STATS.forEach((stat, i) => {
          const el = document.querySelector<HTMLElement>(`.sv-${i}`);
          if (!el) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: stat.value,
            duration: 2.2,
            ease: "power2.out",
            delay: i * 0.1,
            snap: { val: stat.decimals === 0 ? 1 : 0 },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            onUpdate() {
              el.textContent = stat.formatFn(obj.val);
            },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".stat-item", { opacity: 1, y: 0, filter: "none" });
        STATS.forEach((stat, i) => {
          const el = document.querySelector<HTMLElement>(`.sv-${i}`);
          if (el) el.textContent = stat.formatFn(stat.value);
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16"
      style={{
        background: "linear-gradient(135deg, #0a0a18 0%, #040410 100%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-item relative flex-1 flex flex-col items-center justify-center py-10 sm:py-0 sm:px-8 text-center"
            >
              {/* Vertical divider between items */}
              {i > 0 && (
                <div
                  aria-hidden
                  className="hidden sm:block absolute left-0 top-6 bottom-6 w-px"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              )}

              {/* Animated number */}
              <div
                className={`sv-${i} font-black leading-none tracking-tight text-white`}
                style={{
                  fontSize: "clamp(2.8rem, 5vw, 5rem)",
                  letterSpacing: "-0.04em",
                }}
              >
                {stat.display}
              </div>

              {/* Label */}
              <p
                className="font-mono uppercase mt-3"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  color: "rgba(58,142,255,0.6)",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
