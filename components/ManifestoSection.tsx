"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const LINES = [
  "L'aviation est une passion.",
  "Une passion mérite une sculpture.",
  "Pas une maquette en plastique.",
  "Une pièce de résine coulée sous pression.",
  "Peinte à la main.",
  "Avec une LED sous le cockpit.",
  "Pour ceux qui savent.",
];

/* Renders one line broken into animated word spans */
function AnimatedLine({
  line,
  lineIndex,
}: {
  line: string;
  lineIndex: number;
}) {
  const words = line.split(" ");

  return (
    <p style={{ lineHeight: 1.18, margin: 0 }}>
      {words.map((word, wi) => (
        <motion.span
          key={wi}
          className="inline-block mr-[0.28em]"
          variants={{
            hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                delay: lineIndex * 0.12 + wi * 0.05,
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  /* Fire once when 25 % of the section enters the viewport */
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  const sigDelay = LINES.length * 0.12 + 0.3;

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-44 overflow-hidden"
      style={{ background: "#000000" }}
      aria-label="Notre manifeste"
    >
      {/* Subtle vignette to draw focus to centre */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 md:px-12 text-center">
        {/* Manifesto text — word-by-word stagger */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: {} }}
          className="flex flex-col gap-4"
          style={{
            fontSize: "clamp(1.8rem,4vw,4.5rem)",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.025em",
          }}
        >
          {LINES.map((line, i) => (
            <AnimatedLine key={i} line={line} lineIndex={i} />
          ))}
        </motion.div>

        {/* Blue rule */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={
            isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }
          }
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay: sigDelay,
          }}
          className="mt-14 mb-7 mx-auto"
          style={{
            height: 1,
            maxWidth: 160,
            background:
              "linear-gradient(90deg, transparent, rgba(58,142,255,0.6), transparent)",
            transformOrigin: "center",
          }}
        />

        {/* Signature */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={
            isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
          }
          transition={{
            duration: 0.7,
            ease: "easeOut",
            delay: sigDelay + 0.22,
          }}
          className="font-mono text-[0.65rem] tracking-[0.28em] uppercase"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          AirplaneStore — depuis 2024
        </motion.p>
      </div>
    </section>
  );
}
