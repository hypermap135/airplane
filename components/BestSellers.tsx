"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";
import TiltCard from "./TiltCard";
import { PRODUCTS } from "@/lib/products";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)", scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function BestSellers() {
  const bestsellers = PRODUCTS.filter((p) => p.bestseller && p.inStock).slice(0, 4);

  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 500px at 10% 60%, rgba(58,142,255,0.06), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Bestsellers"
          title="Les modèles préférés des passionnés"
          subtitle="Quatre pièces iconiques, toutes en stock — prêtes à livrer."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {bestsellers.map((p, i) => (
            <motion.div key={p.id} variants={cardVariant} className="relative">
              {i === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute -top-3 left-4 z-20 px-3 py-1 rounded-full bg-led/15 border border-led/35 backdrop-blur-sm"
                >
                  <span className="hud text-led text-[0.65rem]">★ MEILLEURE VENTE</span>
                </motion.div>
              )}
              <TiltCard intensity={8}>
                <ProductCard product={p} />
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/collections/all" className="btn-chrome">
            Voir toute la collection →
          </Link>
          <Link href="/collections/packs" className="btn-ghost">
            Packs et offres
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
