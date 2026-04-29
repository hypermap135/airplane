"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [gravure, setGravure] = useState(false);
  const { add } = useCart();
  const { setOpen } = useCartDrawer();

  const GRAVURE_VARIANT_ID = "53749941698900";

  const onAdd = () => {
    if (!product.inStock) return;
    add(product.variantId, 1);
    if (gravure) add(GRAVURE_VARIANT_ID, 1);
    setOpen(true);
  };

  const relatedItems = related(product, 4);

  return (
    <div style={{ background: "#010108", minHeight: "100vh" }}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20 pt-28 pb-24">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10" style={{ opacity: 0.45 }}>
          <Link href="/" className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-white hover:opacity-100 transition-opacity">
            Accueil
          </Link>
          <span className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.5)" }}>/</span>
          <Link href={`/collections/${product.collection}`}
            className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-white hover:opacity-100 transition-opacity capitalize">
            {product.collection}
          </Link>
          <span className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.5)" }}>/</span>
          <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
            {product.title}
          </span>
        </nav>

        {/* Main grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">

          {/* ── Image ── */}
          <div className="relative" style={{ borderRadius: "1.5rem", overflow: "hidden", background: "#0c0c1a" }}>
            {/* Glow ring */}
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
              borderRadius: "inherit",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 80px rgba(58,142,255,0.05)",
            }} />

            <div style={{ aspectRatio: "4/5", position: "relative" }}>
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  style={{ display: "block" }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                  style={{ background: "linear-gradient(145deg, #0d0d20 0%, #080816 100%)" }}>
                  <svg width="80" height="40" viewBox="0 0 64 32" fill="none" opacity={0.15}>
                    <path d="M2 20 L20 8 L44 6 L58 14 L44 14 L36 20 Z" fill="white"/>
                    <path d="M20 14 L20 22 L16 24" stroke="white" strokeWidth="1.5"/>
                  </svg>
                  <span className="font-mono text-[0.6rem] tracking-[0.22em] uppercase" style={{ color: "rgba(58,142,255,0.4)" }}>
                    {product.collection} · {product.scale ?? "maquette"}
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "linear-gradient(to top, rgba(12,12,26,0.6) 0%, transparent 40%)",
              }} />

              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(1,1,8,0.65)", backdropFilter: "blur(6px)" }}>
                  <span className="font-mono text-[0.75rem] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Épuisé
                  </span>
                </div>
              )}

              {/* Scale badge */}
              {product.scale && (
                <div className="absolute bottom-4 right-4">
                  <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
                    {product.scale}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width: 20, height: 1, background: "rgba(58,142,255,0.6)" }} />
              <span className="font-mono text-[0.6rem] tracking-[0.28em] uppercase" style={{ color: "rgba(58,142,255,0.6)" }}>
                Collection {product.collection}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-black uppercase leading-[0.92] tracking-tight text-white mb-2"
              style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", letterSpacing: "-0.02em" }}>
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-[1rem] leading-relaxed mb-6" style={{ color: "#6a7080" }}>
                {product.subtitle}
              </p>
            )}

            {/* Stars */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.95rem" }}>★</span>
                ))}
              </div>
              <span className="font-bold text-white text-[0.88rem]">4.9</span>
              <span className="font-mono text-[0.58rem] tracking-[0.12em]" style={{ color: "#565870" }}>· +2 000 avis clients</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-6">
              <div className="font-black text-white" style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)" }}>
                {formatPrice(product.price)}
              </div>
              {product.compareAt && (
                <>
                  <div className="text-[1rem] line-through mb-1" style={{ color: "#2a3040" }}>
                    {formatPrice(product.compareAt)}
                  </div>
                  <div className="mb-1 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold"
                    style={{ background: "linear-gradient(135deg, #d0d4da, #ffffff)", color: "#010108" }}>
                    –{Math.round(100 - (product.price / product.compareAt) * 100)}%
                  </div>
                </>
              )}
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

            {/* Trust badges — ABOVE CTA */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: "🚚", top: "Livraison", bot: "7–15 jours" },
                { icon: "↩", top: "Retour",    bot: "30 jours" },
                { icon: "🔒", top: "Paiement", bot: "Sécurisé" },
              ].map((item) => (
                <div key={item.top} className="flex flex-col items-center justify-center gap-1 py-3"
                  style={{
                    borderRadius: "0.875rem",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(12,12,26,0.6)",
                  }}>
                  <span aria-hidden style={{ fontSize: "1rem" }}>{item.icon}</span>
                  <div className="font-mono text-[0.55rem] tracking-[0.15em] uppercase" style={{ color: "#3a4055" }}>
                    {item.top}
                  </div>
                  <div className="font-semibold text-white text-[0.78rem]">{item.bot}</div>
                </div>
              ))}
            </div>

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
                    }}>
                    {gravure && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
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
            <div className="mb-8">
              {product.inStock ? (
                <button onClick={onAdd} className="btn-chrome w-full text-center justify-center">
                  {gravure ? `Ajouter au panier — ${formatPrice(product.price + 15)} →` : "Ajouter au panier →"}
                </button>
              ) : (
                <NotifyForm
                  productTitle={product.title}
                  submitted={submitted}
                  onSubmit={() => setSubmitted(true)}
                />
              )}
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
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {[...SPECS, ...(product.scale ? [{ label: "Échelle", value: product.scale }] : [])].map((s, i) => (
                  <div key={s.label} className="flex items-center justify-between py-3 gap-6"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <dt className="font-mono text-[0.65rem] tracking-[0.1em] uppercase" style={{ color: "#3a4055" }}>
                      {s.label}
                    </dt>
                    <dd className="text-[0.82rem] text-white text-right">{s.value}</dd>
                  </div>
                ))}
              </div>
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
    </div>
  );
}

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
          Merci ! Nous vous préviendrons dès que <span className="text-white font-medium">{productTitle}</span> sera de nouveau disponible.
        </p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (email.trim().length > 3) onSubmit(); }}
          className="flex flex-col sm:flex-row gap-2">
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
