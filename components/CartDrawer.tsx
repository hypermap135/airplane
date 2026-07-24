"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { checkoutUrl, DISCOUNT_CODE } from "@/lib/shopify";
import { trackMeta } from "@/lib/meta";

const FREE_SHIPPING_THRESHOLD = 100;
const EMAIL_STORAGE_KEY = "airplanestore.lead-email";

export default function CartDrawer() {
  const { open, setOpen } = useCartDrawer();
  const { entries, subtotal, update, remove } = useCart();
  const [promo, setPromo] = useState(DISCOUNT_CODE);
  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(EMAIL_STORAGE_KEY)) setEmailSaved(true);
  }, []);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!v.includes("@")) return;
    setEmailSaved(true);
    localStorage.setItem(EMAIL_STORAGE_KEY, v);
    trackMeta("Lead", { content_name: "cart_capture", value: subtotal, currency: "EUR" });
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, source: "cart-drawer" }),
      });
    } catch { /* silent */ }
  };

  const discount = promoApplied && promo.trim().toUpperCase() === DISCOUNT_CODE ? 0.1 : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const onCheckout = async () => {
    if (entries.length === 0 || loading) return;
    setLoading(true);
    trackMeta("InitiateCheckout", {
      content_ids: entries.map((e) => e.product.id),
      content_type: "product",
      contents: entries.map((e) => ({ id: e.product.id, quantity: e.quantity, item_price: e.product.price })),
      currency: "EUR",
      value: total,
      num_items: entries.reduce((sum, e) => sum + e.quantity, 0),
    });
    try {
      const items = entries.map((e) => {
        const item: { variantId: string; quantity: number; attributes?: { key: string; value: string }[] } = {
          variantId: e.product.variantId,
          quantity: e.quantity,
        };
        if (e.attributes && e.attributes.length > 0) item.attributes = e.attributes;
        return item;
      });
      const appliedDiscount = promoApplied ? promo.trim().toUpperCase() : undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, discount: appliedDiscount }),
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) { window.location.href = data.url; return; }
      }
      window.location.href = checkoutUrl(items, appliedDiscount ?? null);
    } catch {
      const items = entries.map((e) => ({ variantId: e.product.variantId, quantity: e.quantity }));
      window.location.href = checkoutUrl(items, promoApplied ? promo.trim().toUpperCase() : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Panier"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-ink-line shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-line shrink-0">
          <div className="font-bold text-ink-900">Votre panier</div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 grid place-items-center rounded-full border border-ink-line text-ink-500 hover:text-ink-900 hover:border-ink-900 transition"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-5 pt-4 shrink-0">
          <div
            className="rounded-md p-3 border"
            style={{
              background: remaining === 0 ? "#e8f7ef" : "var(--brand-blue-light)",
              borderColor: remaining === 0 ? "#a8e0be" : "rgba(28,126,230,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span aria-hidden>{remaining === 0 ? "🎉" : "🚚"}</span>
              <p className="text-sm font-semibold text-ink-900">
                {remaining === 0
                  ? "Livraison offerte débloquée !"
                  : (
                    <>
                      Plus que <span className="text-brand font-bold">{formatPrice(remaining)}</span>{" "}
                      pour la livraison offerte
                    </>
                  )}
              </p>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden bg-white/60">
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: remaining === 0 ? "var(--status-green)" : "var(--brand-blue)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {entries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-3">
                Vide
              </div>
              <p className="text-sm text-ink-500">Votre panier est vide pour l'instant.</p>
              <Link
                href="/collections/all"
                onClick={() => setOpen(false)}
                className="btn-secondary mt-6 inline-flex"
                style={{ textDecoration: "none" }}
              >
                Voir la collection
              </Link>
            </div>
          )}

          {entries.map(({ product, quantity, attributes }) => (
            <div
              key={product.variantId + (attributes ? JSON.stringify(attributes) : "")}
              className="flex gap-3 border border-ink-line rounded-md p-3 bg-white"
            >
              <div className="relative h-20 w-20 shrink-0 rounded overflow-hidden bg-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "8%",
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold text-ink-900 truncate">
                    {product.title}
                  </div>
                  <button
                    onClick={() => remove(product.variantId)}
                    className="text-ink-300 hover:text-status-red text-sm"
                    aria-label={`Retirer ${product.title}`}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-ink-500 mt-0.5">{formatPrice(product.price)}</div>
                {attributes && attributes.length > 0 && (
                  <div className="text-xs text-ink-500 mt-1 space-y-0.5">
                    {attributes.map((a, i) => (
                      <div key={i}>
                        <span className="text-ink-700">{a.key} :</span> {a.value}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded border border-ink-line">
                    <button
                      onClick={() => update(product.variantId, quantity - 1)}
                      className="h-7 w-7 grid place-items-center text-ink-700 hover:text-ink-900"
                      aria-label="Diminuer"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm text-ink-900">{quantity}</span>
                    <button
                      onClick={() => update(product.variantId, quantity + 1)}
                      className="h-7 w-7 grid place-items-center text-ink-700 hover:text-ink-900"
                      aria-label="Augmenter"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm font-bold text-ink-900">
                    {formatPrice(product.price * quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / checkout */}
        <div className="border-t border-ink-line px-5 py-4 space-y-3 shrink-0 bg-[#fafbfc]">
          {entries.length > 0 && !emailSaved && (
            <form onSubmit={submitEmail}>
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-2">
                📧 Garder le panier
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="flex-1 px-3 py-2 text-sm rounded border border-ink-line bg-white text-ink-900 outline-none focus:border-brand"
                />
                <button type="submit" className="btn-secondary text-xs px-3">Recevoir</button>
              </div>
              <p className="text-[11px] text-ink-500 mt-1">
                On vous envoie le rappel + −10% si vous oubliez. Pas de spam.
              </p>
            </form>
          )}
          {entries.length > 0 && emailSaved && (
            <div className="text-xs text-status-green flex items-center gap-1.5">
              ✓ Votre panier est sauvegardé
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-2">
              Code promo
            </div>
            <div className="flex gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="TAKEOFF10"
                className="flex-1 px-3 py-2 text-sm rounded border border-ink-line bg-white text-ink-900 outline-none focus:border-brand"
              />
              <button
                onClick={() => setPromoApplied(true)}
                disabled={promo.trim() === ""}
                className="btn-secondary text-xs px-3 disabled:opacity-40"
              >
                Appliquer
              </button>
            </div>
            {promoApplied && discount > 0 && (
              <div className="mt-1.5 text-xs text-status-green">✓ Code appliqué — 10% de réduction</div>
            )}
            {promoApplied && discount === 0 && (
              <div className="mt-1.5 text-xs text-status-red">Code invalide.</div>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>Sous-total</span>
              <span className="font-semibold text-ink-900">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-status-green">
                <span>Réduction (-10%)</span>
                <span className="font-semibold">−{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-line pt-2 mt-2">
              <span className="font-bold text-ink-900">Total</span>
              <span className="font-bold text-ink-900 text-lg">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={entries.length === 0 || loading}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Redirection…" : "Commander →"}
          </button>
          <div className="text-[11px] text-ink-500 text-center">
            Paiement sécurisé Shopify · Checkout invité disponible
          </div>
        </div>
      </aside>
    </>
  );
}
