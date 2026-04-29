"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { checkoutUrl, DISCOUNT_CODE } from "@/lib/shopify";

const FREE_SHIPPING_THRESHOLD = 100;

export default function CartDrawer() {
  const { open, setOpen } = useCartDrawer();
  const { entries, subtotal, update, remove } = useCart();
  const [promo, setPromo] = useState(DISCOUNT_CODE);
  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const discount = promoApplied && promo.trim().toUpperCase() === DISCOUNT_CODE ? 0.1 : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const onCheckout = async () => {
    if (entries.length === 0 || loading) return;
    setLoading(true);
    try {
      const items = entries.map((e) => ({ variantId: e.product.variantId, quantity: e.quantity }));
      const appliedDiscount = promoApplied ? promo.trim().toUpperCase() : undefined;

      // Try API route first (uses Storefront API if token available, else permalink)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, discount: appliedDiscount }),
      });

      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Hard fallback (client-side permalink)
      window.location.href = checkoutUrl(items, appliedDiscount ?? null);
    } catch {
      // Last resort fallback
      const items = entries.map((e) => ({ variantId: e.product.variantId, quantity: e.quantity }));
      window.location.href = checkoutUrl(items, promoApplied ? promo.trim().toUpperCase() : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink-900/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal
        aria-label="Panier"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-ink-800 border-l border-ink-border shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-border">
          <div className="display text-sm text-white">Votre panier</div>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 grid place-items-center rounded-full border border-white/15 hover:border-white/40"
            aria-label="Fermer le panier"
          >
            ×
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center justify-between hud text-white/60">
            <span>Livraison offerte dès 100€</span>
            <span>
              {remaining === 0 ? "✓ Offerte" : `Encore ${formatPrice(remaining)}`}
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-ink-500 overflow-hidden">
            <div
              className="h-full bg-chrome-grad transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ maxHeight: "calc(100vh - 340px)" }}>
          {entries.length === 0 && (
            <div className="text-center text-mute py-12">
              <div className="hud mb-3">Vide</div>
              <p className="text-sm">Votre panier est vide pour l'instant.</p>
              <Link
                href="/collections/all"
                onClick={() => setOpen(false)}
                className="btn-ghost mt-6 inline-flex"
              >
                Voir la collection
              </Link>
            </div>
          )}

          {entries.map(({ product, quantity }) => (
            <div
              key={product.variantId}
              className="flex gap-4 border border-ink-border rounded-xl p-3 bg-ink-600/50"
            >
              <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-ink-500">
                <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="display text-[0.78rem] text-white truncate">{product.title}</div>
                  <button
                    onClick={() => remove(product.variantId)}
                    className="text-xs text-mute hover:text-white"
                    aria-label={`Retirer ${product.title}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-1 text-xs text-mute">{formatPrice(product.price)}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-ink-border">
                    <button
                      onClick={() => update(product.variantId, quantity - 1)}
                      className="h-8 w-8 grid place-items-center hover:text-white text-mute"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-sm">{quantity}</span>
                    <button
                      onClick={() => update(product.variantId, quantity + 1)}
                      className="h-8 w-8 grid place-items-center hover:text-white text-mute"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-mono text-sm text-white">
                    {formatPrice(product.price * quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-border px-5 py-5 space-y-4 bg-ink-700/60">
          <div>
            <div className="hud text-white/50 mb-2">Code promo</div>
            <div className="flex gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="TAKEOFF10"
                className="flex-1 bg-ink-900 border border-ink-border rounded-full px-4 py-2 text-sm text-white outline-none focus:border-white/40"
              />
              <button
                onClick={() => setPromoApplied(true)}
                disabled={promo.trim() === ""}
                className="btn-ghost disabled:opacity-40"
              >
                Appliquer
              </button>
            </div>
            {promoApplied && discount > 0 && (
              <div className="mt-2 text-xs text-led">✓ Code appliqué — 10% de réduction</div>
            )}
            {promoApplied && discount === 0 && (
              <div className="mt-2 text-xs text-mute">Code invalide.</div>
            )}
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-mute">
              <span>Sous-total</span>
              <span className="font-mono text-white">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-led">
                <span>Réduction (-10%)</span>
                <span className="font-mono">−{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-border pt-2 mt-2">
              <span className="display text-white text-sm">Total</span>
              <span className="font-mono text-white text-base">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={entries.length === 0 || loading}
            className="btn-chrome w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Redirection…
              </>
            ) : (
              "Commander →"
            )}
          </button>
          <div className="text-[0.68rem] text-mute text-center">
            Paiement sécurisé Shopify · Checkout invité disponible
          </div>
        </div>
      </aside>
    </>
  );
}
