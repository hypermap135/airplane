"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";
import { trackMeta } from "@/lib/meta";
import { useWishlist } from "@/lib/wishlist";
import { pushToast } from "@/lib/toast";
import { useState } from "react";

/**
 * Airmodels-style product card. White tile, gray photo pad, black CTA.
 * `priority` should be true only for above-the-fold cards.
 */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add }      = useCart();
  const { setOpen }  = useCartDrawer();
  const wishlist     = useWishlist();
  const [imgError, setImgError] = useState(false);
  const liked = wishlist.has(product.handle);

  const outOfStock = !product.inStock || product.variantId === "0";

  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlist.toggle(product.handle);
  };

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    add(product.variantId, 1);
    pushToast(`${product.title} ajouté au panier`);
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
    <Link
      href={`/products/${product.handle}`}
      className="tile group"
      style={{ textDecoration: "none" }}
    >
      {/* Image area */}
      <div className="tile-image relative">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 48vw"
            quality={90}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            style={{ objectFit: "contain", padding: "8%" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="grid place-items-center w-full h-full text-ink-300">
            <svg width="42" height="21" viewBox="0 0 64 32" fill="none">
              <path d="M2 20 L20 8 L44 6 L58 14 L44 14 L36 20 Z" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
        )}

        {/* Featured / Bestseller badge */}
        {product.bestseller && (
          <span className="badge-featured absolute top-3 left-3">
            <span aria-hidden>★</span> Featured
          </span>
        )}

        {/* Promo badge */}
        {product.compareAt && product.compareAt > product.price && (
          <span className="absolute top-3 right-3 bg-ink-900 text-white text-xs font-bold px-2 py-0.5 rounded">
            −{Math.round(100 - (product.price / product.compareAt) * 100)}%
          </span>
        )}

        {/* Wishlist heart */}
        <button
          onClick={onToggleWishlist}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={liked}
          className="absolute bottom-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-white shadow-sm transition-transform hover:scale-110"
          style={{ border: "1px solid var(--line)", cursor: "pointer" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={liked ? "#e24b4a" : "none"}
            stroke={liked ? "#e24b4a" : "#5c6270"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Out of stock veil — very visible so users know instantly */}
        {outOfStock && (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-2 rounded"
              style={{
                background: product.comingSoon ? "#f0c040" : "#c93030",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {product.comingSoon ? "Bientôt" : "Épuisé"}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="tile-body">
        <div className="text-ink-900 font-semibold text-sm leading-tight line-clamp-2 min-h-[2.6em]">
          {product.title}
        </div>
        <div className="text-ink-900 font-bold text-lg">
          {formatPrice(product.price)}
          {product.compareAt && product.compareAt > product.price && (
            <span className="ml-2 text-sm font-normal text-ink-300 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>
        <div className={outOfStock ? "status-out" : "status-in-stock"}>
          {outOfStock ? (product.comingSoon ? "Bientôt disponible" : "Épuisé") : "En stock"}
        </div>
        {outOfStock ? (
          <div
            className="mt-2 w-full text-xs text-center font-semibold uppercase tracking-widest py-3 rounded"
            style={{
              background: product.comingSoon ? "rgba(240,192,64,0.15)" : "rgba(201,48,48,0.10)",
              color: product.comingSoon ? "#8a6f0d" : "#c93030",
              border: `1px solid ${product.comingSoon ? "#f0c040" : "#c93030"}55`,
            }}
          >
            {product.comingSoon ? "Nous prévenir" : "Prévenez-moi"}
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="btn-primary mt-2 w-full text-xs"
          >
            Ajouter au panier
          </button>
        )}
      </div>
    </Link>
  );
}
