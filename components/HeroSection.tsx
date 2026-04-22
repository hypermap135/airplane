"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import { useRef, useEffect, useCallback, useState } from "react";

// ─── Assets ───────────────────────────────────────────────────────────────────
const IMG = "https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg";

// ─── Cinematic timing (seconds) ───────────────────────────────────────────────
const D = {
  grid: 0.1,
  stars: 0.2,
  beams: 0.5,
  planeZoom: 0.6,
  planeSettle: 1.5,
  reticle: 1.7,
  callouts: 2.0,
  eyebrow: 2.1,
  title: 2.25,
  sub: 2.85,
  ctas: 3.1,
  corners: 2.5,
  marquee: 3.4,
};

const TITLE_WORDS = ["Maquettes", "d'avion", "en résine", "premium"];
const BEAM_ANGLES = [-18, -10, -4, 0, 4, 10, 18];

const CALLOUTS = [
  { label: "47 CM", sub: "LONGUEUR", x: "7%", y: "28%", align: "left" as const },
  { label: "1/147", sub: "ÉCHELLE", x: "80%", y: "18%", align: "right" as const },
  { label: "LED", sub: "INTÉGRÉ", x: "80%", y: "70%", align: "right" as const },
  { label: "Résine", sub: "MONOBLOC", x: "7%", y: "68%", align: "left" as const },
];

const SPECS = [
  "47 CM", "Échelle 1/147", "LED intégré", "4.9 / 5 ★",
  "Livraison 7–15 j", "Résine monobloc", "Socle bois massif", "Made in France",
];

// ─── Canvas starfield ──────────────────────────────────────────────────────────
function Starfield({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.25,
      a: Math.random() * 0.5 + 0.1,
      sp: Math.random() * 0.5 + 0.2,
      ph: Math.random() * Math.PI * 2,
    }));

    let t = 0, id = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const tw = 0.6 + 0.4 * Math.sin(t * s.sp + s.ph);
        ctx.beginPath();
        ctx.arc(
          s.x * canvas.width + mx * 14,
          s.y * canvas.height + my * 9,
          s.r, 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(180,215,255,${s.a * tw})`;
        ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [visible]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}

// ─── Targeting reticle SVG ─────────────────────────────────────────────────────
function Reticle({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <svg
      viewBox="0 0 400 300"
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      aria-hidden
    >
      {/* Corner brackets */}
      {[
        { x: 30, y: 30, rot: 0 },
        { x: 370, y: 30, rot: 90 },
        { x: 370, y: 270, rot: 180 },
        { x: 30, y: 270, rot: 270 },
      ].map((c, i) => (
        <motion.g
          key={i}
          transform={`rotate(${c.rot} ${c.x} ${c.y})`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: D.reticle + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.line
            x1={c.x} y1={c.y} x2={c.x + 20} y2={c.y}
            stroke="rgba(58,142,255,0.7)" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: D.reticle + i * 0.06, duration: 0.3 }}
          />
          <motion.line
            x1={c.x} y1={c.y} x2={c.x} y2={c.y + 20}
            stroke="rgba(58,142,255,0.7)" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: D.reticle + i * 0.06 + 0.1, duration: 0.3 }}
          />
        </motion.g>
      ))}

      {/* Center crosshair — thin */}
      <motion.line x1="196" y1="145" x2="204" y2="145"
        stroke="rgba(58,142,255,0.5)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }}
        transition={{ delay: D.reticle + 0.3, duration: 0.4 }} />
      <motion.line x1="200" y1="141" x2="200" y2="149"
        stroke="rgba(58,142,255,0.5)" strokeWidth="1"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }}
        transition={{ delay: D.reticle + 0.35, duration: 0.4 }} />

      {/* Dashed border that draws itself */}
      <motion.rect
        x="30" y="30" width="340" height="240" rx="4"
        fill="none"
        stroke="rgba(58,142,255,0.2)"
        strokeWidth="1"
        strokeDasharray="6 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: D.reticle + 0.2, duration: 1.0, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Radar scan line ───────────────────────────────────────────────────────────
function RadarScan({ shouldReduce }: { shouldReduce: boolean }) {
  if (shouldReduce) return null;
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 h-[1px] pointer-events-none z-30"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(58,142,255,0.12) 20%, rgba(58,142,255,0.5) 50%, rgba(58,142,255,0.12) 80%, transparent 100%)",
        boxShadow: "0 0 8px rgba(58,142,255,0.4)",
      }}
      initial={{ top: "0%", opacity: 0 }}
      animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 2.5,
        delay: D.reticle + 0.5,
        repeat: Infinity,
        repeatDelay: 5,
        ease: "linear",
      }}
    />
  );
}

// ─── Main hero ─────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);

  // Scroll-based fade out
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], ["0%", "10%"]);

  // Mouse parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 55, damping: 16 });
  const smoothY = useSpring(rawY, { stiffness: 55, damping: 16 });

  const blobX1 = useTransform(smoothX, [-1, 1], [-80, 80]);
  const blobY1 = useTransform(smoothY, [-1, 1], [-55, 55]);
  const blobX2 = useTransform(smoothX, [-1, 1], [60, -60]);
  const blobY2 = useTransform(smoothY, [-1, 1], [45, -45]);
  const planeX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const planeY = useTransform(smoothY, [-1, 1], [-12, 12]);
  const textX = useTransform(smoothX, [-1, 1], [-5, 5]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (shouldReduce) return;
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    },
    [rawX, rawY, shouldReduce]
  );

  // Trigger stars slightly after mount
  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative h-[100svh] min-h-[700px] overflow-hidden flex flex-col items-center justify-center bg-ink-900"
    >
      {/* ── Layer 0: Starfield canvas ── */}
      {!shouldReduce && <Starfield visible={sceneReady} />}

      {/* ── Layer 1: HUD grid ── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: D.grid }}
        className="absolute inset-0 grid-hud"
      />

      {/* ── Layer 2: Approach runway beams (from below, converging) ── */}
      {!shouldReduce && (
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          {BEAM_ANGLES.map((angle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: D.beams + i * 0.05, duration: 0.8, ease: "easeOut" }}
              className="absolute"
              style={{
                bottom: "-10%",
                left: "50%",
                width: 1,
                height: "70vh",
                transformOrigin: "bottom center",
                transform: `rotate(${angle}deg) translateX(-50%)`,
                background: `linear-gradient(to top, rgba(58,142,255,${0.18 - Math.abs(angle) * 0.005}), transparent 85%)`,
                filter: "blur(1.5px)",
              }}
            />
          ))}
          {/* Ground glow source */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: D.beams, duration: 0.7 }}
            className="absolute"
            style={{
              bottom: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 280,
              height: 40,
              background: "radial-gradient(ellipse, rgba(58,142,255,0.35) 0%, transparent 70%)",
              filter: "blur(16px)",
            }}
          />
        </div>
      )}

      {/* ── Layer 3: Atmosphere blobs — mouse reactive ── */}
      {!shouldReduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 700, height: 700,
              top: "-10%", left: "5%",
              x: blobX1, y: blobY1,
              background: "radial-gradient(circle, rgba(58,142,255,0.15) 0%, transparent 68%)",
              filter: "blur(80px)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 500, height: 500,
              bottom: "5%", right: "5%",
              x: blobX2, y: blobY2,
              background: "radial-gradient(circle, rgba(90,150,255,0.12) 0%, transparent 68%)",
              filter: "blur(70px)",
            }}
          />
        </>
      )}

      {/* ── Layer 4: Airplane cinematic showcase ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: shouldReduce ? 1 : contentOpacity,
          y: shouldReduce ? 0 : contentY,
        }}
      >
        {/* Plane container */}
        <motion.div
          className="relative"
          style={{
            width: "min(640px, 90vw)",
            x: shouldReduce ? 0 : planeX,
            y: shouldReduce ? 0 : planeY,
          }}
        >
          {/* LED underglow — pulsing */}
          {!shouldReduce && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scaleX: 0.3 }}
              animate={{
                opacity: [0, 0.7, 0.5, 0.8, 0.5],
                scaleX: [0.3, 1, 1, 1, 1],
              }}
              transition={{ delay: D.planeSettle, duration: 0.5, times: [0, 0.3, 0.5, 0.7, 1], repeat: 0 }}
              className="absolute inset-x-[5%] pointer-events-none"
              style={{
                bottom: "-8%",
                height: "50%",
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(58,142,255,0.55) 0%, rgba(58,142,255,0.15) 50%, transparent 70%)",
                filter: "blur(22px)",
              }}
            >
              {/* Continuous pulse */}
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(58,142,255,0.4) 0%, transparent 70%)",
                }}
              />
            </motion.div>
          )}

          {/* SVG contrail — draws from left (tail side) */}
          {!shouldReduce && (
            <svg
              viewBox="0 0 640 300"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              aria-hidden
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(58,142,255,0)" />
                  <stop offset="60%" stopColor="rgba(58,142,255,0.18)" />
                  <stop offset="100%" stopColor="rgba(58,142,255,0.45)" />
                </linearGradient>
                <filter id="cgblur">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="70%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
                </linearGradient>
              </defs>
              {/* Upper contrail */}
              <motion.path
                d="M -100 130 C 50 128 150 132 300 136"
                stroke="url(#cg)"
                strokeWidth="18"
                fill="none"
                filter="url(#cgblur)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: D.planeSettle + 0.2, duration: 0.8, ease: "easeOut" }}
              />
              {/* Thin core */}
              <motion.path
                d="M -100 132 C 50 130 150 133 300 137"
                stroke="url(#cg2)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: D.planeSettle + 0.3, duration: 0.7, ease: "easeOut" }}
              />
              {/* Lower contrail */}
              <motion.path
                d="M -100 160 C 50 157 150 159 300 162"
                stroke="url(#cg)"
                strokeWidth="14"
                fill="none"
                filter="url(#cgblur)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ delay: D.planeSettle + 0.35, duration: 0.75, ease: "easeOut" }}
              />
            </svg>
          )}

          {/* Targeting reticle */}
          <Reticle visible={!shouldReduce} />

          {/* Radar scan line */}
          <RadarScan shouldReduce={!!shouldReduce} />

          {/* THE PLANE — cinematic zoom-in */}
          <motion.div
            initial={{ scale: 0.06, opacity: 0, filter: "blur(24px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{
              scale: { duration: 1.05, delay: D.planeZoom, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.5, delay: D.planeZoom + 0.15 },
              filter: { duration: 0.9, delay: D.planeZoom + 0.1, ease: "easeOut" },
            }}
            className="relative z-10"
          >
            {/* Gentle float after settle */}
            <motion.div
              animate={shouldReduce ? {} : { y: [-6, 6, -6] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: D.planeSettle + 0.5 }}
            >
              {/* Image with radial mask + metallic glow */}
              <div
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 78% 78% at 50% 48%, black 30%, rgba(0,0,0,0.8) 55%, transparent 75%)",
                  maskImage:
                    "radial-gradient(ellipse 78% 78% at 50% 48%, black 30%, rgba(0,0,0,0.8) 55%, transparent 75%)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG}
                  alt="Maquette Airbus A380 Air France"
                  className="w-full h-auto block"
                  style={{
                    filter:
                      "drop-shadow(0 0 30px rgba(58,142,255,0.55)) drop-shadow(0 0 80px rgba(58,142,255,0.2)) brightness(1.08) contrast(1.06)",
                  }}
                  fetchPriority="high"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* HUD callout badges */}
          {CALLOUTS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: D.callouts + i * 0.1,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute z-30 pointer-events-none"
              style={{
                left: c.x,
                top: c.y,
                transform: c.align === "right" ? "translateX(-100%)" : "none",
              }}
            >
              <div
                className={`flex flex-col ${c.align === "right" ? "items-end" : "items-start"}`}
              >
                <div className="hud text-led text-[0.7rem] font-bold">{c.label}</div>
                <div className="hud text-white/35 text-[0.58rem]">{c.sub}</div>
                {/* Dot connector */}
                <motion.div
                  animate={shouldReduce ? {} : { opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-1 w-1 h-1 rounded-full bg-led/70"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Text content (below the plane) ── */}
        <motion.div
          style={{ x: shouldReduce ? 0 : textX }}
          className="relative z-20 mt-6 md:mt-8 text-center px-5 max-w-4xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: D.eyebrow }}
            className="inline-flex items-center gap-3 hud text-led/80"
          >
            {!shouldReduce && (
              <motion.span
                animate={{ opacity: [1, 0.1, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-led"
                aria-hidden
              />
            )}
            Édition 2026 · Collection Résine Premium
          </motion.div>

          {/* Title — word by word */}
          <div className="overflow-hidden mt-5">
            <motion.h1
              className="display text-[clamp(2.4rem,7vw,5.8rem)] leading-[0.88] tracking-[0.04em]"
              style={{ perspective: "1200px" }}
            >
              {TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 48, filter: "blur(12px)", rotateX: -45 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: D.title + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`inline-block ${i < 2 ? "chrome-text" : "text-white"}`}
                  style={{
                    marginRight: "0.22em",
                    transformOrigin: "bottom center",
                    display: "inline-block",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: D.sub }}
            className="mt-5 text-mute text-base md:text-[1.05rem] max-w-lg mx-auto leading-relaxed"
          >
            Répliques fidèles coulées en résine monobloc. Fuselage illuminé. Livraison France & Europe.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: D.ctas }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/collections/all" className="btn-chrome">
              Découvrir la collection
            </Link>
            <Link href="/collections/packs" className="btn-ghost">
              Voir les packs →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── HUD corners (always on top) ── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: D.corners, duration: 0.8 }}
        className="absolute top-[74px] left-5 md:left-9 z-30 hidden sm:flex flex-col gap-0.5"
      >
        <div className="hud text-white/25 flex items-center gap-2">
          <motion.span
            animate={shouldReduce ? {} : { opacity: [1, 0.15, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-led/60"
          />
          SYS · AIRPLANESTORE.FR
        </div>
        <div className="hud text-white/12 text-[0.6rem] pl-5">ÉDITION 2026</div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: D.corners, duration: 0.8 }}
        className="absolute top-[74px] right-5 md:right-9 z-30 text-right hidden sm:flex flex-col gap-0.5"
      >
        <div className="hud text-white/25 flex items-center justify-end gap-2">
          RÉSINE · LED · 1/147
          <motion.span
            animate={shouldReduce ? {} : { opacity: [1, 0.15, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 1.4 }}
            className="w-1.5 h-1.5 rounded-full bg-led/60"
          />
        </div>
        <div className="hud text-white/12 text-[0.6rem] pr-5">COLLECTION PREMIUM</div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      {!shouldReduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: D.marquee + 0.3, duration: 1 }}
          aria-hidden
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-1"
        >
          <span className="hud text-white/20 text-[0.6rem]">SCROLL</span>
          <motion.div
            animate={{ y: [0, 14, 0], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-led/60 via-led/20 to-transparent"
          />
        </motion.div>
      )}

      {/* ── Bottom spec marquee ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: D.marquee, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-30"
      >
        <div className="divider-led" />
        <div className="overflow-hidden py-3.5">
          <div className="marquee-track">
            {[...SPECS, ...SPECS].map((s, i) => (
              <span key={i} className="hud text-white/35 mx-8 shrink-0">
                <span className="text-led/50 mr-8">·</span>
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
