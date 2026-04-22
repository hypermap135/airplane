"use client";

import { motion, useReducedMotion } from "framer-motion";

const SPECS = [
  { label: "Durée", value: "~20s" },
  { label: "Batterie", value: "75 mAh" },
  { label: "Charge", value: "~1h USB" },
];

export default function LEDSection() {
  const shouldReduce = useReducedMotion();

  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-ink-900">
      {/* Background glow — more dramatic */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(700px 500px at 65% 50%, rgba(58,142,255,0.12), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-hud opacity-30" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 grid gap-14 lg:grid-cols-2 items-center">
        {/* Image with pulsing LED ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-2 lg:order-1"
        >
          {/* Outer glow ring — pulsing */}
          {!shouldReduce && (
            <div
              aria-hidden
              className="absolute inset-[-3px] rounded-[1.6rem] pointer-events-none animate-pulse-led"
            />
          )}

          {/* Image frame */}
          <div className="relative aspect-square hublot overflow-hidden">
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{
                backgroundImage:
                  "url(https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg)",
              }}
            />

            {/* Blue LED overlay that pulses */}
            {!shouldReduce ? (
              <motion.div
                aria-hidden
                className="absolute inset-0"
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  background: [
                    "radial-gradient(350px 220px at 50% 60%, rgba(58,142,255,0.35), transparent 70%), linear-gradient(180deg, rgba(10,10,20,0.6) 0%, rgba(10,10,20,0.92) 100%)",
                    "radial-gradient(450px 300px at 50% 55%, rgba(58,142,255,0.65), transparent 65%), linear-gradient(180deg, rgba(10,10,20,0.5) 0%, rgba(10,10,20,0.88) 100%)",
                    "radial-gradient(350px 220px at 50% 60%, rgba(58,142,255,0.35), transparent 70%), linear-gradient(180deg, rgba(10,10,20,0.6) 0%, rgba(10,10,20,0.92) 100%)",
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(350px 220px at 50% 60%, rgba(58,142,255,0.45), transparent 70%), linear-gradient(180deg, rgba(10,10,20,0.55) 0%, rgba(10,10,20,0.9) 100%)",
                }}
              />
            )}

            {/* LED indicator badge */}
            <div className="absolute bottom-5 left-5 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-ink-900/70 border border-led/30 backdrop-blur-sm">
              {!shouldReduce ? (
                <motion.span
                  aria-hidden
                  animate={{ opacity: [1, 0.1, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-block w-2 h-2 rounded-full bg-led"
                />
              ) : (
                <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-led" />
              )}
              <span className="hud text-led text-[0.68rem]">LED ACTIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 lg:order-2"
        >
          <div className="hud text-led/80">FONCTIONNALITÉ EXCLUSIVE</div>

          <h2 className="display mt-4 text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.95] chrome-text">
            Elle s'illumine.
          </h2>

          <p className="mt-6 text-mute text-base md:text-[1.05rem] leading-relaxed max-w-lg">
            LED intégré dans le fuselage et le cockpit. Environ 20 secondes d'illumination par
            pression. Activation par interrupteur sous la maquette. Batterie lithium rechargeable
            par USB — câble fourni.
          </p>

          {/* Spec cards */}
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-sm">
            {SPECS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="card-bento px-4 py-4"
              >
                <div className="hud text-white/40 text-[0.65rem]">{s.label}</div>
                <div className="mt-1.5 font-mono font-bold text-white text-sm">{s.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Glow divider */}
          <div className="mt-10 divider-led max-w-sm" />
          <p className="mt-5 hud text-white/35">
            Câble de charge inclus · Interrupteur sous le socle
          </p>
        </motion.div>
      </div>
    </section>
  );
}
