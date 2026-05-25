"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Stat = {
  display: string;
  value: number;
  suffix: string;
  label: string;
  decimals: number;
  formatFn: (v: number) => string;
  /** When true, the value is rendered statically — no count-up animation. */
  staticValue?: boolean;
};

const STATS: Stat[] = [
  {
    display: "1 847",
    value: 1847,
    suffix: "",
    label: "Passionnés",
    decimals: 0,
    formatFn: (v: number) => Math.round(v).toLocaleString("fr-FR"),
  },
  {
    display: "4,8/5",
    value: 4.8,
    suffix: "/5",
    label: "Note moyenne",
    decimals: 1,
    formatFn: (v: number) => v.toFixed(1).replace(".", ",") + "/5",
    staticValue: true, // ★ rating stays at 4,8/5 — no counter animation
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

        /* Animated counters — start from 70% of target so we never show
           a jarring "0" before the value animates up.
           Stats with staticValue:true are rendered as-is (no counter). */
        STATS.forEach((stat, i) => {
          const el = document.querySelector<HTMLElement>(`.sv-${i}`);
          if (!el) return;

          // Static value → pin the formatted value and skip the count-up.
          if (stat.staticValue) {
            el.textContent = stat.formatFn(stat.value);
            return;
          }

          const startVal = stat.value * 0.7;
          el.textContent = stat.formatFn(startVal);
          const obj = { val: startVal };
          gsap.to(obj, {
            val: stat.value,
            duration: 1.6,
            ease: "power2.out",
            delay: i * 0.08,
            snap: { val: stat.decimals === 0 ? 1 : 0 },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            onUpdate() {
              el.textContent = stat.formatFn(obj.val);
            },
            onComplete() {
              // Lock final value to avoid any rounding quirks
              el.textContent = stat.formatFn(stat.value);
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
