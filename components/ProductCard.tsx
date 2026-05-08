"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";
import { trackMeta } from "@/lib/meta";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { add }      = useCart();
  const { setOpen }  = useCartDrawer();
  const [imgError, setImgError] = useState(false);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock || product.variantId === "0") return;
    add(product.variantId, 1);
    setOpen(true);
    trackMeta("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      contents: [{ id: product.id, quantity: 1, item_price: product.price }],
      currency: "EUR",
      value: product.price,
      num_items: 1,
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{ borderRadius: "1.25rem", overflow: "hidden" }}
    >
      <Link href={`/products/${product.handle}`} className="block relative group" style={{ background: "#080810" }}>

        {/* ── Image block ── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", background: "#080810" }}>
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ padding: "5%", transform: "scale(1.08) translateY(-6%)" }}
              loading="eager"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0) el.classList.add("loaded");
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(145deg,#0d0d22,#060610)" }}>
              <svg width="56" height="28" viewBox="0 0 64 32" fill="none" opacity={0.15}>
                <path d="M2 20 L20 8 L44 6 L58 14 L44 14 L36 20 Z" fill="white"/>
              </svg>
            </div>
          )}

          {/* Gradient overlay — image fades to dark at bottom */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, #080810 0%, rgba(8,8,16,0.75) 45%, rgba(8,8,16,0.15) 70%, transparent 90%)" }} />

          {/* Bestseller badge */}
          {product.bestseller && (
            <div className="absolute top-3 left-3 px-2.5 py-1 flex items-center gap-1.5"
              style={{
                borderRadius: 999,
                background: "rgba(8,8,20,0.7)",
                border: "1px solid rgba(58,142,255,0.35)",
                backdropFilter: "blur(12px)",
              }}>
              <span className="font-mono text-[0.52rem] tracking-[0.22em] uppercase"
                style={{ color: "rgba(120,180,255,0.95)" }}>
                ★ Bestseller
              </span>
            </div>
          )}

          {/* Promo badge */}
          {product.compareAt && (
            <div className="absolute top-3 right-3 px-2 py-0.5 text-[0.65rem] font-black"
              style={{ borderRadius: 6, background: "#fff", color: "#010108" }}>
              –{Math.round(100 - (product.price / product.compareAt) * 100)}%
            </div>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(4,4,14,0.65)", backdropFilter: "blur(4px)" }}>
              <span className="font-mono text-[0.68rem] tracking-[0.28em] uppercase text-white/40">
                {product.comingSoon ? "Bientôt disponible" : "Épuisé"}
              </span>
            </div>
          )}
        </div>

        {/* ── Content block ── */}
        <div className="px-4 pt-3 pb-4" style={{ background: "#080810" }}>
          {/* Collection eyebrow */}
          <p className="font-mono text-[0.5rem] tracking-[0.28em] uppercase mb-1.5"
            style={{ color: "rgba(58,142,255,0.5)" }}>
            {product.collection}{product.scale ? ` · ${product.scale}` : ""}
          </p>

          {/* Title */}
          <h3 className="font-bold text-white leading-snug mb-3"
            style={{ fontSize: "0.9rem", letterSpacing: "-0.01em" }}>
            {product.title}
          </h3>

          {/* Price + CTA row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-black text-white" style={{ fontSize: "1.15rem", letterSpacing: "-0.03em" }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAt && (
                <span className="ml-2 text-[0.72rem] line-through" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {formatPrice(product.compareAt)}
                </span>
              )}
            </div>

            {product.inStock ? (
              <button
                onClick={onAdd}
                className="shrink-0 font-semibold text-[0.68rem] tracking-wide transition-all duration-200"
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(58,142,255,0.22)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(58,142,255,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
                }}
              >
                + Panier
              </button>
            ) : (
              <span className="shrink-0 text-[0.65rem] font-mono tracking-wide"
                style={{ color: "rgba(255,255,255,0.2)" }}>
                {product.comingSoon ? "Bientôt" : "Épuisé"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
