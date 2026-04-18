"use client";

import { motion } from "framer-motion";

export default function LEDSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-ink-900">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 300px at 70% 50%, rgba(58,142,255,0.15), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8 grid gap-12 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative order-2 lg:order-1 aspect-square hublot"
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage:
                "url(https://airplanestore.fr/cdn/shop/files/a380-airfrance.jpg)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(300px 180px at 50% 55%, rgba(58,142,255,0.55), transparent 70%), linear-gradient(180deg, rgba(10,10,20,0.7) 0%, rgba(10,10,20,0.95) 100%)",
            }}
          />
          <div className="absolute bottom-6 left-6 hud text-led">● LED ACTIVE</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="order-1 lg:order-2"
        >
          <div className="hud text-led">FONCTIONNALITÉ EXCLUSIVE</div>
          <h2 className="display mt-3 text-[clamp(2rem,5vw,3.6rem)] leading-[1] chrome-text">
            Elle s'illumine.
          </h2>
          <p className="mt-6 text-mute text-base md:text-lg max-w-xl">
            LED intégré dans le fuselage et le cockpit. Environ 20 secondes d'illumination par
            pression. Activation par interrupteur sous la maquette. Batterie lithium rechargeable
            par USB — câble fourni, temps de charge ~1h.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Spec label="Durée" value="~20s" />
            <Spec label="Batterie" value="75 mAh" />
            <Spec label="Charge" value="~1h USB" />
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-600/60 px-4 py-3">
      <div className="hud text-white/50">{label}</div>
      <div className="mt-1 font-mono text-white text-sm">{value}</div>
    </div>
  );
}
