"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, related, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";

const SPECS: { label: string; value: string }[] = [
  { label: "Matière",             value: "Résine monobloc" },
  { label: "Longueur",            value: "~47 cm" },
  { label: "Poids",               value: "~1,3 kg" },
  { label: "Socle",               value: "Bois massif inclus" },
  { label: "Train d'atterrissage",value: "Amovible" },
  { label: "Éclairage",           value: "LED ~20 s · USB" },
  { label: "Batterie",            value: "75 mAh · charge ~1h" },
];

export default function ProductDetail({ product }: { product: Product }) {
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const [activeImg, setActiveImg] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [gravure, setGravure] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});
  const { add } = useCart();
  const { setOpen } = useCartDrawer();

  const GRAVURE_VARIANT_ID = "53749941698900";

  const onAdd = () => {
    if (!product.inStock) return;
    add(product.variantId, 1);
    if (gravure) add(GRAVURE_VARIANT_ID, 1);
    setOpen(true);
  };

  const handleThumbError = useCallback((idx: number) => {
    setThumbErrors(prev => ({ ...prev, [idx]: true }));
  }, []);

  const relatedItems = related(product, 4);

  const collectionLabel = product.collection.charAt(0).toUpperCase() + product.collection.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: "#030308", minHeight: "100vh" }}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 pt-28 pb-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10" style={{ opacity: 0.45 }}>
          <Link href="/" className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-white hover:opacity-100 transition-opacity">
            Accueil
          </Link>
          <span className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.5)" }}>/</span>
          <Link
            href={`/collections/${product.collection}`}
            className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-white hover:opacity-100 transition-opacity capitalize"
          >
            {collectionLabel}
          </Link>
          <span className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.5)" }}>/</span>
          <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
            {product.title}
          </span>
        </nav>

        {/* Main grid */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-24 items-start">

          {/* ── Image gallery ── */}
          <div className="relative">
            {/* Radial glow behind image */}
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                inset: "-20% -30%",
                background: "radial-gradient(ellipse 70% 60% at 40% 50%, rgba(26,74,255,0.12) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />

            <div className="relative z-10 flex flex-col gap-3">
              {/* Main image */}
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: "1.5rem",
                  background: "#0c0c1a",
                  aspectRatio: "1/1",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.6)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    style={{ display: "block", padding: "4%", transform: "scale(1.1) translateY(-6%)", filter: "brightness(1.18) contrast(0.96)" }}
                  />
                </AnimatePresence>

                {/* Gradient overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(to top, #0c0c1a 0%, rgba(12,12,26,0.7) 40%, rgba(12,12,26,0.1) 70%, transparent 90%)",
                }} />

                {/* Out of stock overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(3,3,8,0.65)", backdropFilter: "blur(6px)" }}>
                    <span className="font-mono text-[0.75rem] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {product.comingSoon ? "Bientôt disponible" : "Épuisé"}
                    </span>
                  </div>
                )}

                {/* Scale badge */}
                {product.scale && (
                  <div className="absolute bottom-4 right-4">
                    <span
                      className="font-mono text-[0.6rem] tracking-[0.18em] uppercase px-2.5 py-1"
                      style={{
                        borderRadius: 999,
                        background: "rgba(3,3,8,0.7)",
                        border: "1px solid rgba(58,142,255,0.25)",
                        color: "rgba(58,142,255,0.7)",
                      }}
                    >
                      {product.scale}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip — horizontal scroll on all screens */}
              {images.length > 1 && (
                <div
                  className="flex gap-2.5 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {images.map((src, idx) => (
                    <ThumbButton
                      key={idx}
                      src={src}
                      alt={`${product.title} — vue ${idx + 1}`}
                      active={activeImg === idx}
                      hasError={!!thumbErrors[idx]}
                      onError={() => handleThumbError(idx)}
                      onClick={() => setActiveImg(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col">

            {/* Collection breadcrumb in mono small caps */}
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 20, height: 1, background: "rgba(58,142,255,0.6)" }} />
              <Link
                href={`/collections/${product.collection}`}
                className="font-mono text-[0.6rem] tracking-[0.28em] transition-opacity hover:opacity-100"
                style={{ color: "rgba(58,142,255,0.6)", textTransform: "uppercase", fontVariant: "small-caps" }}
              >
                ★ Collection · {collectionLabel}
              </Link>
            </div>

            {/* Title */}
            <h1
              className="font-black uppercase leading-tight text-white mb-2"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.02em",
                lineHeight: 0.95,
              }}
            >
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-[1rem] leading-relaxed mb-5" style={{ color: "#6a7080" }}>
                {product.subtitle}
              </p>
            )}

            {/* Star rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.95rem" }}>★</span>
                ))}
              </div>
              <span className="font-bold text-white text-[0.88rem]">4.9</span>
              <span className="font-mono text-[0.58rem] tracking-[0.12em]" style={{ color: "#565870" }}>
                · +2 000 avis clients
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-6">
              <div className="font-black text-white" style={{ fontSize: "clamp(2rem,3vw,3rem)", lineHeight: 1 }}>
                {formatPrice(product.price + (gravure ? 15 : 0))}
              </div>
              {product.compareAt && (
                <>
                  <div className="text-[1rem] line-through mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {formatPrice(product.compareAt)}
                  </div>
                  <div className="mb-1 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold"
                    style={{ background: "linear-gradient(135deg, #d0d4da, #ffffff)", color: "#010108" }}>
                    –{Math.round(100 - (product.price / product.compareAt) * 100)}%
                  </div>
                </>
              )}
            </div>

            {/* Trust badges — glass pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: "🚀", label: "Livraison 7–15j" },
                { icon: "↩️", label: "30j retour" },
                { icon: "🔒", label: "Paiement sécurisé" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-2"
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <span aria-hidden style={{ fontSize: "0.85rem" }}>{icon}</span>
                  <span className="font-mono text-[0.58rem] tracking-[0.1em] uppercase text-white" style={{ opacity: 0.65 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Stock urgency */}
            {product.inStock && product.bestseller && (
              <div className="flex items-center gap-2 mb-5 px-3 py-2.5"
                style={{
                  borderRadius: "0.75rem",
                  background: "rgba(251,146,60,0.07)",
                  border: "1px solid rgba(251,146,60,0.2)",
                }}>
                <span style={{ color: "#fb923c", fontSize: "0.9rem" }}>⚡</span>
                <span className="font-mono text-[0.62rem] tracking-[0.12em] uppercase" style={{ color: "rgba(251,146,60,0.9)" }}>
                  Dernières pièces disponibles
                </span>
              </div>
            )}

            {/* Gravure upsell */}
            {product.collection !== "accessoires" && product.inStock && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setGravure(v => !v)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-all duration-200"
                  style={{
                    borderRadius: "1rem",
                    background: gravure ? "rgba(58,142,255,0.07)" : "rgba(12,12,26,0.6)",
                    border: gravure ? "1px solid rgba(58,142,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Checkbox */}
                  <div className="shrink-0 flex items-center justify-center"
                    style={{
                      width: 20, height: 20,
                      borderRadius: 5,
                      border: gravure ? "2px solid #3a8eff" : "2px solid rgba(255,255,255,0.2)",
                      background: gravure ? "#3a8eff" : "transparent",
                      transition: "all 0.15s ease",
                    }}>
                    {gravure && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-[0.84rem]">Ajouter une gravure personnalisée</span>
                      <span className="font-mono text-[0.65rem] font-bold px-2 py-0.5"
                        style={{
                          borderRadius: 999,
                          background: "linear-gradient(135deg, #c8ccd0, #f0f2f5)",
                          color: "#010108",
                        }}>+15€</span>
                    </div>
                    <p className="text-[0.74rem] mt-0.5" style={{ color: "#565870" }}>
                      Nom, date ou immatriculation gravés laser sur le socle
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* CTA */}
            <div className="mb-4">
              {product.inStock ? (
                <motion.button
                  onClick={onAdd}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full font-black text-white text-[0.9rem] tracking-[0.1em] uppercase py-4 px-8 transition-all duration-200"
                  style={{
                    borderRadius: "0.875rem",
                    background: "linear-gradient(135deg, #1a4aff, #0a2fd4)",
                    boxShadow: "0 8px 32px rgba(26,74,255,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #2a5aff, #1a3fe4)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(26,74,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #1a4aff, #0a2fd4)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(26,74,255,0.35), inset 0 1px 0 rgba(255,255,255,0.12)";
                  }}
                >
                  {gravure
                    ? `Ajouter au panier — ${formatPrice(product.price + 15)} →`
                    : "Ajouter au panier →"}
                </motion.button>
              ) : (
                <NotifyForm
                  productTitle={product.title}
                  submitted={submitted}
                  onSubmit={() => setSubmitted(true)}
                />
              )}
            </div>

            {/* Secondary link */}
            <div className="mb-8">
              <Link
                href={`/collections/${product.collection}`}
                className="inline-flex items-center gap-1 font-mono text-[0.62rem] tracking-[0.15em] uppercase transition-opacity hover:opacity-100"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Voir toute la collection {collectionLabel} →
              </Link>
            </div>

            {/* Payment logos */}
            <div className="flex items-center gap-2 mb-10">
              <span className="font-mono text-[0.58rem] tracking-[0.12em] uppercase mr-1" style={{ color: "#3a4055" }}>Paiement :</span>
              {["Visa", "MC", "CB", "PayPal", "Apple Pay"].map(p => (
                <div key={p} className="px-2 py-1 font-mono text-[0.55rem] tracking-wide"
                  style={{
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                  {p}
                </div>
              ))}
            </div>

            {/* Specs */}
            <div>
              <div className="font-mono text-[0.6rem] tracking-[0.28em] uppercase mb-4" style={{ color: "rgba(58,142,255,0.5)" }}>
                Caractéristiques
              </div>
              <dl style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {[...SPECS, ...(product.scale ? [{ label: "Échelle", value: product.scale }] : [])].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between py-3 gap-6"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <dt className="font-mono text-[0.65rem] tracking-[0.1em] uppercase" style={{ color: "#3a4055" }}>
                      {s.label}
                    </dt>
                    <dd className="font-mono text-[0.82rem] text-white text-right">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedItems.length > 0 && (
          <div className="mt-24 md:mt-32">
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: "3rem" }} />
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 20, height: 1, background: "rgba(58,142,255,0.6)" }} />
              <span className="font-mono text-[0.6rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
                Dans la même collection
              </span>
            </div>
            <h2 className="font-black uppercase leading-[0.9] tracking-tight text-white mb-10"
              style={{ fontSize: "clamp(1.6rem,3.5vw,2.6rem)", letterSpacing: "-0.02em" }}>
              Dans le même esprit
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Thumbnail button ─────────────────────────────────────────────────── */

function ThumbButton({
  src,
  alt,
  active,
  hasError,
  onError,
  onClick,
}: {
  src: string;
  alt: string;
  active: boolean;
  hasError: boolean;
  onError: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      aria-pressed={active}
      style={{
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: active
          ? "2px solid rgba(58,142,255,0.7)"
          : "2px solid rgba(255,255,255,0.06)",
        background: "#0c0c1a",
        cursor: "pointer",
        transition: "border-color 0.2s ease, opacity 0.2s ease",
        opacity: active ? 1 : 0.5,
        flexShrink: 0,
        width: 80,
        height: 80,
      }}
    >
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={onError}
          style={{ display: "block", padding: "8%", transform: "scale(1.1) translateY(-5%)" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(145deg, #0d0d20 0%, #080816 100%)" }}>
          <svg width="24" height="12" viewBox="0 0 64 32" fill="none" opacity={0.15}>
            <path d="M2 20 L20 8 L44 6 L58 14 L44 14 L36 20 Z" fill="white"/>
          </svg>
        </div>
      )}
    </button>
  );
}

/* ── Notify form (out of stock) ───────────────────────────────────────── */

function NotifyForm({
  productTitle,
  submitted,
  onSubmit,
}: {
  productTitle: string;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="p-5" style={{
      borderRadius: "1.25rem",
      border: "1px solid rgba(58,142,255,0.2)",
      background: "rgba(12,12,26,0.8)",
    }}>
      <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-3" style={{ color: "rgba(58,142,255,0.7)" }}>
        ● Actuellement épuisé
      </div>
      <h3 className="font-bold text-white text-[0.9rem] mb-4">Prévenez-moi du retour en stock</h3>
      {submitted ? (
        <p className="text-[0.85rem]" style={{ color: "#6a7080" }}>
          Merci ! Nous vous préviendrons dès que{" "}
          <span className="text-white font-medium">{productTitle}</span>{" "}
          sera de nouveau disponible.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); if (email.trim().length > 3) onSubmit(); }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
            className="flex-1 text-[0.82rem] outline-none"
            style={{
              background: "rgba(1,1,8,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 999,
              padding: "0.65rem 1.1rem",
              color: "white",
            }}
          />
          <button type="submit" className="btn-chrome">Prévenez-moi</button>
        </form>
      )}
    </div>
  );
}
