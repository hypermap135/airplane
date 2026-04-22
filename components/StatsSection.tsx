"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatDef {
  value: number;
  suffix: string;
  label: string;
  hud: string;
  decimals?: number;
}

const STATS: StatDef[] = [
  { value: 2000, suffix: "+", label: "Passionnés nous font confiance", hud: "CLI" },
  { value: 4.9, suffix: "/5", label: "Note moyenne clients vérifiés", hud: "RTG", decimals: 1 },
  { value: 47, suffix: " cm", label: "Longueur de chaque maquette", hud: "DIM" },
  { value: 30, suffix: "j", label: "Retour garanti satisfait ou remboursé", hud: "SVC" },
];

function CountUp({ target, suffix, decimals = 0, duration = 2 }: {
  target: number;
  suffix: string;
  decimals?: number;
  duration?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const hasRun = useRef(false);
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayed(target);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, decimals]);

  const formatted =
    decimals > 0
      ? displayed.toFixed(decimals).replace(".", ",")
      : Math.round(displayed).toLocaleString("fr-FR");

  return (
    <span ref={elRef}>
      {formatted}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden border-y border-ink-border">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1000px 400px at 50% 50%, rgba(58,142,255,0.06), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-hud opacity-35" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.hud}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="card-bento px-5 py-6 md:px-7 md:py-8 text-center"
            >
              <div className="hud text-led/60 text-[0.65rem] mb-3">{stat.hud}</div>
              <div className="font-display font-black chrome-text text-[clamp(2.2rem,5vw,3.4rem)] leading-none tracking-tight">
                <CountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <p className="mt-3 text-[0.77rem] text-mute leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
