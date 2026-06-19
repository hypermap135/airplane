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
    display: "347",
    value: 347,
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
      className="relative py-20 md:py-24"
      style={{
        background:
          "linear-gradient(180deg, #06060f 0%, #0a0a18 50%, #06060f 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Editorial crumb — same vocab as the hero ("★ N°… · Édition 2026") */}
        <div className="flex items-center gap-3 mb-10 md:mb-14">
          <div
            aria-hidden
            style={{
              width: 28,
              height: 1,
              background: "rgba(58,142,255,0.65)",
            }}
          />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              color: "rgba(58,142,255,0.75)",
            }}
          >
            ★ La maison en chiffres
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 md:gap-x-10">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-item relative flex flex-col"
            >
              {/* Top accent rule — replaces the vertical dividers, more
                  editorial */}
              <div
                aria-hidden
                className="mb-5"
                style={{
                  height: 1,
                  width: 32,
                  background: "rgba(255,255,255,0.18)",
                }}
              />

              {/* Animated number — gradient white→silver, matches the hero h1 */}
              <div
                className={`sv-${i} font-black leading-[0.95]`}
                style={{
                  fontSize: "clamp(2.6rem, 5.2vw, 4.8rem)",
                  letterSpacing: "-0.035em",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #c8ccd2 60%, #888 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.display}
              </div>

              {/* Label — same mono caps treatment as the hero crumbs */}
              <p
                className="font-mono uppercase mt-4"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.28em",
                  color: "rgba(255,255,255,0.55)",
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
