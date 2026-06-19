"use client";

/**
 * HERO V4 — "Carousel"
 * Full-bleed slideshow of 6 hero products. One slide = one product
 * (large lifestyle photo + name + subtitle + price + "Découvrir" CTA).
 * Auto-advances every 6 s, pauses on hover. Pagination dots + a
 * slide counter ("03 / 06") sit bottom-right.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Slide = {
  handle: string;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  badge?: string;
};

const SLIDES: Slide[] = [
  {
    handle: "maquette-avion-maquette-airbus-a380",
    title: "Airbus A380 Air France",
    subtitle: "Quadriréacteur long-courrier — livrée Air France",
    price: "99€",
    image: "/images/maquette-avion-maquette-airbus-a380.png",
    badge: "Bestseller",
  },
  {
    handle: "pack-prestige-air-france",
    title: "Pack Prestige Air France",
    subtitle: "A380 + A350 + 777 — trois icônes Air France",
    price: "249€",
    image: "/images/pack-prestige-air-france.png",
    badge: "Bestseller · Pack",
  },
  {
    handle: "concorde-airfrance",
    title: "Concorde Air France",
    subtitle: "L'iconique supersonique — édition échelle 1/125",
    price: "99€",
    image: "/images/concorde-airfrance.png",
  },
  {
    handle: "a320-neo",
    title: "Airbus A320 Air France",
    subtitle: "Moyen-courrier de référence — livrée Air France",
    price: "99€",
    image: "/images/a320-neo.png",
  },
  {
    handle: "airbus-a380-emirates",
    title: "Airbus A380 Emirates",
    subtitle: "Le plus grand avion commercial — livrée Emirates",
    price: "99€",
    image: "/images/airbus-a380-emirates.png",
  },
  {
    handle: "maquette-avion-maquette-boeing-747",
    title: "Boeing 747 Air France",
    subtitle: "Le Queen of the Skies en livrée Air France",
    price: "99€",
    image: "/images/maquette-avion-maquette-boeing-747.png",
    badge: "Bestseller",
  },
];

const AUTOPLAY_MS = 6000;

export default function HeroV4Carousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const slide = SLIDES[active];

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        height: "min(92vh, 900px)",
        minHeight: 560,
        background: "#06060f",
      }}
      aria-label="AirplaneStore — sélection de maquettes phares"
    >
      {/* ── Cross-fading background images ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.handle}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: 7, ease: "linear" } }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={active === 0}
            sizes="100vw"
            quality={95}
            className="object-cover"
            style={{ objectPosition: "center 55%" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay for legibility — strong at the bottom (text band),
          subtle at the top (badge + counter) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6,6,15,0.55) 0%, rgba(6,6,15,0.15) 30%, rgba(6,6,15,0.0) 50%, rgba(6,6,15,0.85) 100%)",
        }}
      />

      {/* ── Top brand crumb + slide counter ── */}
      <div
        className="absolute top-6 left-6 right-6 md:top-10 md:left-12 md:right-12 z-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            style={{ width: 28, height: 1, background: "rgba(58,142,255,0.65)" }}
          />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              color: "rgba(58,142,255,0.75)",
            }}
          >
            ★ Airplanestore · Sélection 2026
          </span>
        </div>
        <span
          className="font-mono"
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Bottom-left slide content (animated) ── */}
      <div
        className="absolute left-0 right-0 z-10"
        style={{
          bottom: "clamp(3rem, 9vh, 6rem)",
          padding: "0 clamp(1.5rem, 6vw, 4rem)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.handle}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            {slide.badge && (
              <span
                className="font-mono uppercase inline-block mb-4"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.24em",
                  color: "#ffd76b",
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(255,215,107,0.12)",
                  border: "1px solid rgba(255,215,107,0.35)",
                }}
              >
                ★ {slide.badge}
              </span>
            )}
            <h1
              className="font-black text-white"
              style={{
                fontSize: "clamp(2rem, 5.2vw, 4.4rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.025em",
              }}
            >
              {slide.title}
            </h1>
            <p
              className="mt-4"
              style={{
                fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
                color: "rgba(255,255,255,0.78)",
                maxWidth: 560,
                lineHeight: 1.55,
              }}
            >
              {slide.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span
                className="font-bold text-white"
                style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)" }}
              >
                {slide.price}
              </span>
              <Link
                href={`/products/${slide.handle}`}
                className="font-bold inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
                style={{
                  background: "#fff",
                  color: "#06060f",
                  padding: "0.95rem 1.8rem",
                  borderRadius: 999,
                  fontSize: "0.85rem",
                  letterSpacing: "0.04em",
                }}
              >
                Découvrir
                <span aria-hidden style={{ fontSize: "1.1em" }}>
                  →
                </span>
              </Link>
              <Link
                href="/#collection"
                className="font-semibold transition-opacity"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  padding: "0.95rem 1.3rem",
                  fontSize: "0.8rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(6px)",
                }}
              >
                Toute la collection
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Pagination dots (bottom center) ── */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.handle}
            onClick={() => setActive(i)}
            aria-label={`Aller à la slide ${i + 1}`}
            className="transition-all"
            style={{
              height: 3,
              width: i === active ? 28 : 16,
              background:
                i === active ? "#ffffff" : "rgba(255,255,255,0.28)",
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
