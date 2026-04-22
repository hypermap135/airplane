"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useRef, useCallback } from "react";

const HERO_IMAGE = "https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg";

const LINE1 = "Maquettes d'avion".split(" ");
const LINE2 = "en résine premium".split(" ");

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
};

const wordVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)", rotateX: -30 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    rotateX: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 41 + 7) % 100}%`,
  duration: 5 + (i * 0.7) % 5,
  delay: (i * 0.38) % 4.5,
  size: i % 3 === 0 ? 2.5 : 1.5,
  rise: 280 + (i * 60) % 350,
}));

const SPECS = ["47 cm", "Échelle 1/147", "LED intégré", "4.9 / 5 ★", "Livraison 7–15 j", "Résine monobloc", "Socle bois massif"];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imgScrollY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ["0%", "12%"]);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  const blob1X = useTransform(smoothMouseX, [-1, 1], [-70, 70]);
  const blob1Y = useTransform(smoothMouseY, [-1, 1], [-50, 50]);
  const blob2X = useTransform(smoothMouseX, [-1, 1], [50, -50]);
  const blob2Y = useTransform(smoothMouseY, [-1, 1], [40, -40]);
  const imgMouseX = useTransform(smoothMouseX, [-1, 1], [-25, 25]);
  const imgMouseY = useTransform(smoothMouseY, [-1, 1], [-18, 18]);
  const textX = useTransform(smoothMouseX, [-1, 1], [-6, 6]);
  const textY = useTransform(smoothMouseY, [-1, 1], [-4, 4]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (shouldReduce) return;
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    },
    [mouseX, mouseY, shouldReduce]
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative h-[100svh] min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* HUD grid */}
      <div aria-hidden className="absolute inset-0 grid-hud opacity-60" />

      {/* Animated gradient mesh — mouse reactive */}
      {!shouldReduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 800,
              height: 800,
              left: "5%",
              top: "-15%",
              x: blob1X,
              y: blob1Y,
              background:
                "radial-gradient(circle, rgba(58,142,255,0.18) 0%, rgba(58,142,255,0.06) 45%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 600,
              height: 600,
              right: "0%",
              bottom: "10%",
              x: blob2X,
              y: blob2Y,
              background:
                "radial-gradient(circle, rgba(100,160,255,0.14) 0%, rgba(80,130,255,0.05) 50%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute pointer-events-none rounded-full animate-drift-3"
            style={{
              width: 350,
              height: 350,
              left: "55%",
              top: "30%",
              background:
                "radial-gradient(circle, rgba(58,100,255,0.10) 0%, transparent 70%)",
              filter: "blur(55px)",
            }}
          />
        </>
      )}

      {/* Parallax background image — reacts to both scroll + mouse */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          opacity: 0.32,
          y: shouldReduce ? 0 : imgScrollY,
          x: shouldReduce ? 0 : imgMouseX,
          translateY: shouldReduce ? 0 : imgMouseY,
        }}
      />

      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1600px 800px at 50% 20%, rgba(58,142,255,0.13), transparent 58%), linear-gradient(180deg, rgba(10,10,20,0.2) 0%, rgba(10,10,20,0.65) 55%, rgba(10,10,20,0.98) 100%)",
        }}
      />

      {/* Noise */}
      <div aria-hidden className="absolute inset-0 noise pointer-events-none" />

      {/* Floating particles */}
      {!shouldReduce && (
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-400/70"
              style={{ left: p.left, bottom: "-4px", width: p.size, height: p.size }}
              animate={{
                y: [-4, -p.rise],
                opacity: [0, 0.8, 0.6, 0],
                scale: [0.5, 1, 0.8, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* HUD corners */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.4 }}
        className="absolute top-[76px] left-5 md:left-10 z-10 hidden sm:flex flex-col gap-0.5"
      >
        <div className="hud text-white/30 flex items-center gap-2">
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-led/70"
          />
          SYS · ONLINE
        </div>
        <div className="hud text-white/15 text-[0.62rem] pl-5">AIRPLANESTORE.FR</div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.4 }}
        className="absolute top-[76px] right-5 md:right-10 z-10 text-right hidden sm:flex flex-col gap-0.5"
      >
        <div className="hud text-white/30 flex items-center justify-end gap-2">
          1/147 · LED
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-led/70"
          />
        </div>
        <div className="hud text-white/15 text-[0.62rem] pr-5">RÉSINE PREMIUM</div>
      </motion.div>

      {/* Main content — mouse parallax + scroll fade */}
      <motion.div
        className="relative z-10 mx-auto max-w-5xl text-center px-5"
        style={{
          opacity: shouldReduce ? 1 : contentOpacity,
          y: shouldReduce ? 0 : contentY,
          x: shouldReduce ? 0 : textX,
          translateY: shouldReduce ? 0 : textY,
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="inline-flex items-center gap-3 hud text-led/80"
        >
          <motion.span
            animate={{ opacity: [1, 0.1, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-led"
            aria-hidden
          />
          Édition 2026 · Collection Résine Premium
        </motion.div>

        {/* Title — word by word with blur + rotateX */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="display mt-6 text-[clamp(2.8rem,8vw,6.4rem)] leading-[0.87] tracking-[0.04em]"
          style={{ perspective: "1200px" }}
        >
          <span className="block">
            {LINE1.map((w, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block chrome-text"
                style={{ marginRight: "0.22em", transformOrigin: "bottom center" }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block mt-1">
            {LINE2.map((w, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block text-white"
                style={{ marginRight: "0.22em", transformOrigin: "bottom center" }}
              >
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          className="mt-7 text-base md:text-[1.05rem] text-mute max-w-xl mx-auto leading-relaxed"
        >
          Répliques fidèles coulées en résine monobloc. Fuselage illuminé. Livraison France & Europe.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25 }}
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
          transition={{ duration: 1.2, delay: 2 }}
          aria-hidden
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        >
          <span className="hud text-white/25 text-[0.6rem]">SCROLL</span>
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-led/60 via-led/20 to-transparent"
          />
        </motion.div>
      )}

      {/* Bottom spec marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
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
