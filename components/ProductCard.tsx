"use client";

import Link from "next/link";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";
import { useState } from "react";
import TiltCard from "./TiltCard";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { setOpen } = useCartDrawer();
  const [imgError, setImgError] = useState(false);

  const onAdd = () => {
    if (!product.inStock) return;
    add(product.variantId, 1);
    setOpen(true);
  };

  return (
    <TiltCard className="h-full">
      <article
        className="group relative flex flex-col overflow-hidden transition-all duration-500 h-full"
        style={{
          borderRadius: "1.5rem",
          background: "#0c0c1a",
          border: "1px solid #1c1c2e",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.border = "1px solid rgba(58,142,255,0.25)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.border = "1px solid #1c1c2e";
        }}
      >
        {/* Shimmer line at top */}
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)" }} />

        {/* ── Image ── */}
        <Link href={`/products/${product.handle}`} className="block relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {!imgError ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            /* Fallback: premium dark placeholder with plane silhouette */
            <div className="w-full h-full flex flex-col items-center justify-center gap-3"
              style={{ background: "linear-gradient(145deg, #0d0d20 0%, #080816 100%)" }}>
              <svg width="64" height="32" viewBox="0 0 64 32" fill="none" opacity={0.18}>
                <path d="M2 20 L20 8 L44 6 L58 14 L44 14 L36 20 Z" fill="white"/>
                <path d="M20 14 L20 22 L16 24" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase" style={{ color: "rgba(58,142,255,0.4)" }}>
                {product.collection} · {product.scale ?? "maquette"}
              </span>
            </div>
          )}

          {/* Bottom gradient for legibility */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to top, rgba(12,12,26,0.95) 0%, rgba(12,12,26,0.5) 50%, transparent 80%)",
          }} />

          {/* Badges */}
          {product.bestseller && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1"
              style={{
                borderRadius: 999,
                background: "rgba(58,142,255,0.12)",
                border: "1px solid rgba(58,142,255,0.3)",
                backdropFilter: "blur(12px)",
              }}>
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: "rgba(140,190,255,0.9)" }}>
                ★ Bestseller
              </span>
            </div>
          )}

          {product.compareAt && (
            <div className="absolute top-3 right-3 px-2.5 py-1 text-[0.66rem] font-bold"
              style={{
                borderRadius: 999,
                background: "linear-gradient(135deg, #d0d4da, #ffffff)",
                color: "#010108",
              }}>
              –{Math.round(100 - (product.price / product.compareAt) * 100)}%
            </div>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(1,1,8,0.6)", backdropFilter: "blur(6px)" }}>
              <span className="font-mono text-[0.7rem] tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                {product.comingSoon ? "Bientôt" : "Épuisé"}
              </span>
            </div>
          )}

          {/* Scale badge */}
          {product.scale && (
            <div className="absolute bottom-3 right-3">
              <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "rgba(58,142,255,0.55)" }}>
                {product.scale}
              </span>
            </div>
          )}
        </Link>

        {/* ── Info ── */}
        <div className="flex flex-col p-4 gap-3">
          {/* Stars + low-stock urgency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <span key={i} aria-hidden style={{ color: "#f59e0b", fontSize: "0.72rem", lineHeight: 1 }}>★</span>
              ))}
              <span className="font-mono text-[0.58rem] ml-1" style={{ color: "#565870" }}>4.9</span>
            </div>
            {product.bestseller && product.inStock && (
              <span className="font-mono text-[0.55rem] tracking-[0.1em] uppercase"
                style={{ color: "rgba(251,146,60,0.9)" }}>
                ⚡ Stock limité
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.handle}`}>
                <h3 className="font-bold text-[0.95rem] leading-snug text-white uppercase tracking-wide transition-colors duration-300 group-hover:text-[#8ab4d8]">
                  {product.title}
                </h3>
              </Link>
              {product.subtitle && (
                <p className="mt-1 text-[0.74rem] leading-snug line-clamp-1" style={{ color: "#565870" }}>
                  {product.subtitle}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-white text-[1.1rem]">{formatPrice(product.price)}</div>
              {product.compareAt && (
                <div className="text-[0.7rem] line-through mt-0.5" style={{ color: "#444860" }}>
                  {formatPrice(product.compareAt)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-1">
            {product.inStock ? (
              <button
                onClick={onAdd}
                className="w-full py-3 text-[0.76rem] font-semibold tracking-wide text-white transition-all duration-300 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(58,142,255,0.28)";
                  (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(58,142,255,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.1)";
                }}
              >
                Ajouter au panier
              </button>
            ) : (
              <Link
                href={`/products/${product.handle}`}
                className="block w-full py-3 text-[0.76rem] font-semibold tracking-wide text-center rounded-xl transition-colors duration-300"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}
              >
                {product.comingSoon ? "Me prévenir" : "Prévenez-moi"}
              </Link>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
