"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const HERO_IMAGE = "https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg";

const LINE1 = "Maquettes d'avion".split(" ");
const LINE2 = "en résine premium".split(" ");

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
};

const wordVariant = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const SPECS = ["47 cm", "Échelle 1/147", "LED intégré", "4.9 / 5 ★", "Livraison 7–15 j"];

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], ["0%", "8%"]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* HUD grid */}
      <div aria-hidden className="absolute inset-0 grid-hud opacity-70" />

      {/* Animated gradient mesh blobs */}
      {!shouldReduce && (
        <>
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full animate-drift-1"
            style={{
              width: 700,
              height: 700,
              left: "8%",
              top: "-5%",
              background: "radial-gradient(circle, rgba(58,142,255,0.13) 0%, transparent 70%)",
              filter: "blur(90px)",
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full animate-drift-2"
            style={{
              width: 500,
              height: 500,
              right: "5%",
              bottom: "15%",
              background: "radial-gradient(circle, rgba(100,160,255,0.10) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full animate-drift-3"
            style={{
              width: 350,
              height: 350,
              left: "55%",
              top: "35%",
              background: "radial-gradient(circle, rgba(80,120,255,0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </>
      )}

      {/* Parallax background image */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          opacity: 0.28,
          y: shouldReduce ? 0 : imgY,
        }}
      />

      {/* Gradient overlay — dark at bottom for contrast */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1400px 700px at 50% 20%, rgba(58,142,255,0.12), transparent 60%), linear-gradient(180deg, rgba(10,10,20,0.25) 0%, rgba(10,10,20,0.70) 60%, rgba(10,10,20,0.97) 100%)",
        }}
      />

      {/* Noise */}
      <div aria-hidden className="absolute inset-0 noise pointer-events-none" />

      {/* HUD corner — top left */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute top-[72px] left-5 md:left-9 z-10 hidden sm:block"
      >
        <div className="hud text-white/30 flex items-center gap-2">
          <span className="inline-block w-3 h-px bg-white/30" />
          <span>SYS · ONLINE</span>
        </div>
        <div className="hud text-white/15 text-[0.62rem] mt-0.5 pl-5">AIRPLANESTORE.FR</div>
      </motion.div>

      {/* HUD corner — top right */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute top-[72px] right-5 md:right-9 z-10 text-right hidden sm:block"
      >
        <div className="hud text-white/30 flex items-center justify-end gap-2">
          <span>1/147 · LED</span>
          <span className="inline-block w-3 h-px bg-white/30" />
        </div>
        <div className="hud text-white/15 text-[0.62rem] mt-0.5 pr-5">RÉSINE PREMIUM</div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 mx-auto max-w-5xl text-center px-5"
        style={{ opacity: shouldReduce ? 1 : contentOpacity, y: shouldReduce ? 0 : contentY }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-3 hud text-led/80"
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-led animate-blink"
            aria-hidden
          />
          Édition 2026 · Collection Résine Premium
        </motion.div>

        {/* Title — word by word reveal */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="display mt-6 text-[clamp(2.8rem,7.5vw,6rem)] leading-[0.88] tracking-[0.05em]"
        >
          <span className="block">
            {LINE1.map((w, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block chrome-text"
                style={{ marginRight: "0.22em" }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block mt-2">
            {LINE2.map((w, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block text-white"
                style={{ marginRight: "0.22em" }}
              >
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-7 text-base md:text-[1.05rem] text-mute max-w-xl mx-auto leading-relaxed"
        >
          Répliques fidèles coulées en résine monobloc. Fuselage illuminé. Livraison France & Europe.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/collections/all" className="btn-chrome">
            Découvrir la collection
          </Link>
          <Link href="/collections/packs" className="btn-ghost">
            Voir les packs →
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      {!shouldReduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          aria-hidden
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        >
          <span className="hud text-white/25 text-[0.6rem]">SCROLL</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-9 bg-gradient-to-b from-white/0 via-led/50 to-white/0"
          />
        </motion.div>
      )}

      {/* Bottom spec bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <div className="divider-led" />
        <div className="overflow-hidden py-4">
          <div className="marquee-track">
            {[...SPECS, ...SPECS].map((s, i) => (
              <span key={i} className="hud text-white/40 mx-8 shrink-0">
                <span className="text-led/60 mr-8">·</span>
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
