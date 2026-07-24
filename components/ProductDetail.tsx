"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, related, type Product } from "@/lib/products";
import { trackMeta } from "@/lib/meta";

/**
 * Airmodels-inspired product detail. White base, gray photo tile, black
 * ADD TO CART, sober specs list. Keeps ALL business logic from the previous
 * dark version : multi-variant selector, engraving upsell, notify-me form
 * on out-of-stock, sticky bar, Meta tracking.
 */

const GRAVURE_VARIANT_ID = "53749941698900";

const DEFAULT_SPECS: { label: string; value: string }[] = [
  { label: "Matière",              value: "Résine monobloc" },
  { label: "Longueur",             value: "~47 cm" },
  { label: "Poids",                value: "~1,3 kg" },
  { label: "Socle",                value: "Bois massif inclus" },
  { label: "Train d'atterrissage", value: "Amovible" },
  { label: "Activation LED",       value: "Tap ou clap · ~20 s" },
  { label: "Batterie",             value: "75 mAh · USB ~1h · auto-off" },
];

export default function ProductDetail({ product }: { product: Product }) {
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const [activeImg, setActiveImg] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [gravure, setGravure] = useState(false);
  const [gravureText, setGravureText] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const { add } = useCart();
  const { setOpen } = useCartDrawer();

  const selectedVariant = product.variants?.[activeImg];
  const effectiveVariantId = selectedVariant?.id || product.variantId;
  const variantUnavailable = selectedVariant?.id === "0";

  const trimmedGravure = gravureText.trim();
  const gravureMissing = gravure && trimmedGravure.length === 0;

  const relatedItems = related(product, 4);
  const specs = product.specs && product.specs.length > 0 ? product.specs : DEFAULT_SPECS;
  const collectionLabel = product.collection.charAt(0).toUpperCase() + product.collection.slice(1);

  // Meta ViewContent
  useEffect(() => {
    trackMeta("ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      content_category: product.collection,
      currency: "EUR",
      value: product.price,
    });
  }, [product.id, product.title, product.collection, product.price]);

  // Sticky add-to-cart when the primary CTA scrolls out of view.
  useEffect(() => {
    if (!product.inStock) return;
    const target = document.getElementById("primary-add-to-cart");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [product.inStock]);

  const onAdd = useCallback(() => {
    if (!product.inStock || variantUnavailable) return;
    if (gravureMissing) return;
    add(effectiveVariantId, 1);
    if (gravure) {
      add(GRAVURE_VARIANT_ID, 1, [
        { key: "Texte à graver",   value: trimmedGravure },
        { key: "Produit concerné", value: product.title },
      ]);
    }
    setOpen(true);
    trackMeta("AddToCart", {
      content_ids: [product.id],
      content_name: selectedVariant
        ? `${product.title} — ${selectedVariant.label}`
        : product.title,
      content_type: "product",
      contents: [{ id: product.id, quantity: 1, item_price: product.price }],
      currency: "EUR",
      value: product.price + (gravure ? 15 : 0),
      num_items: gravure ? 2 : 1,
    });
  }, [add, effectiveVariantId, gravure, gravureMissing, product, selectedVariant, setOpen, trimmedGravure, variantUnavailable]);

  const totalPrice = product.price + (gravure ? 15 : 0);
  const hasDiscount = product.compareAt && product.compareAt > product.price;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-8 md:pt-10 pb-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-ink-500 mb-6">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Accueil</Link>
          {" / "}
          <Link href={`/collections/${product.collection}`} style={{ textDecoration: "none", color: "inherit" }}>
            {collectionLabel}
          </Link>
          {" / "}
          <span className="text-ink-900">{product.title}</span>
        </nav>

        {/* ─── Main : gallery + info ─── */}
        <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT : image gallery */}
          <div>
            <div
              className="relative overflow-hidden rounded-md"
              style={{ background: "var(--tile-gray)", aspectRatio: "1 / 1" }}
            >
              <Image
                src={images[activeImg]}
                alt={product.title}
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                style={{ objectFit: "contain", padding: "8%" }}
              />
              {product.bestseller && (
                <span className="badge-featured absolute top-4 left-4">
                  <span aria-hidden>★</span> Featured
                </span>
              )}
              {product.scale && (
                <span className="absolute bottom-4 right-4 bg-white/90 text-ink-700 text-xs font-semibold px-2.5 py-1 rounded">
                  Échelle {product.scale}
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    aria-label={`Vue ${idx + 1}`}
                    aria-pressed={activeImg === idx}
                    className="shrink-0 relative overflow-hidden rounded"
                    style={{
                      width: 72,
                      height: 72,
                      background: "var(--tile-gray)",
                      border: activeImg === idx ? "2px solid var(--brand-blue)" : "2px solid transparent",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="72px"
                      style={{ objectFit: "contain", padding: "8%" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT : info */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
              {collectionLabel}
            </div>
            <h1 className="h-display text-2xl md:text-3xl lg:text-4xl">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="mt-2 text-ink-500">{product.subtitle}</p>
            )}

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-extrabold text-ink-900">
                {formatPrice(totalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-ink-300 line-through">
                  {formatPrice(product.compareAt!)}
                </span>
              )}
              {gravure && (
                <span className="text-sm text-brand">
                  (dont 15€ de gravure)
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-4">
              {product.inStock && !variantUnavailable ? (
                <span className="status-in-stock">En stock · expédié sous 24-48h</span>
              ) : product.comingSoon ? (
                <span className="status-out">Bientôt disponible</span>
              ) : (
                <span className="status-out">Épuisé</span>
              )}
            </div>

            {/* Variant chips (multi-design products) */}
            {product.variants && product.variants.length > 1 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-ink-900 mb-2">
                  Design : <span className="text-ink-500">{product.variants[activeImg].label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className="px-3 py-2 rounded text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: activeImg === idx ? "var(--brand-blue)" : "var(--line)",
                        background: activeImg === idx ? "var(--brand-blue-light)" : "#fff",
                        color: activeImg === idx ? "var(--brand-blue-dark)" : "var(--ink-700)",
                        cursor: "pointer",
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gravure upsell */}
            <div
              className="mt-6 p-4 rounded border"
              style={{
                borderColor: gravure ? "var(--brand-blue)" : "var(--line)",
                background: gravure ? "var(--brand-blue-light)" : "#fafbfc",
              }}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gravure}
                  onChange={(e) => setGravure(e.target.checked)}
                  className="mt-1"
                  style={{ accentColor: "var(--brand-blue)" }}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink-900">
                    Ajouter une gravure personnalisée <span className="text-brand">+15€</span>
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    Prénom, date, phrase courte — gravure laser sur la plaque du socle.
                  </div>
                </div>
              </label>
              {gravure && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={gravureText}
                    onChange={(e) => setGravureText(e.target.value.slice(0, 60))}
                    autoFocus
                    maxLength={60}
                    placeholder="Ex : « Michel — 40 ans de vol · 2026 »"
                    className="w-full px-3 py-2.5 rounded text-sm outline-none"
                    style={{
                      border: `1px solid ${gravureMissing ? "var(--status-red)" : "var(--line)"}`,
                      background: "#fff",
                    }}
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span style={{ color: gravureMissing ? "var(--status-red)" : "var(--ink-500)" }}>
                      {gravureMissing ? "Texte de gravure requis" : "60 caractères maximum"}
                    </span>
                    <span className="text-ink-500">{trimmedGravure.length}/60</span>
                  </div>
                </div>
              )}
            </div>

            {/* CTA — passé en gold pour visibilité (feedback client 00.18.05) */}
            <div className="mt-6">
              {product.inStock && !variantUnavailable ? (
                <button
                  id="primary-add-to-cart"
                  type="button"
                  onClick={onAdd}
                  className="w-full inline-flex items-center justify-center gap-2 font-black uppercase text-sm tracking-widest text-ink-900 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    padding: "1.1rem 1.5rem",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #ffdc73 0%, #f0c040 60%, #d9a52d 100%)",
                    border: "1px solid #d9a52d",
                    boxShadow: "0 6px 20px rgba(240,192,64,0.4)",
                    cursor: "pointer",
                  }}
                >
                  {gravure ? `Ajouter au panier — ${formatPrice(totalPrice)} →` : "Ajouter au panier →"}
                </button>
              ) : variantUnavailable ? (
                <button
                  disabled
                  className="w-full py-3 rounded font-bold text-sm uppercase tracking-widest"
                  style={{ background: "#f0e4c0", color: "#8a6f0d", border: "1px solid #d9b74a" }}
                >
                  Bientôt disponible — choisir un autre design
                </button>
              ) : (
                <NotifyForm
                  productTitle={product.title}
                  submitted={submitted}
                  onSubmit={() => setSubmitted(true)}
                />
              )}
            </div>

            {/* Payment logos + reassurance */}
            <div className="mt-6 space-y-2 text-xs text-ink-500">
              <div className="flex items-center gap-4">
                <span>Paiement :</span>
                {["Visa", "MC", "CB", "PayPal", "Apple Pay"].map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded border border-ink-line text-ink-700">
                    {p}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <span>✓ Livraison France 7-15 j</span>
                <span>✓ Retour gratuit 30 j</span>
                <span>✓ Fait en France</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Description block ─── */}
        {product.description && (
          <div className="mt-16 grid gap-8 md:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="h-display text-xl md:text-2xl mb-4">Description</h2>
              <div className="prose prose-sm md:prose-base max-w-none text-ink-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          </div>
        )}

        {/* ─── Specs ─── */}
        <div className="mt-16">
          <h2 className="h-display text-xl md:text-2xl mb-6">Caractéristiques</h2>
          <div className="grid gap-x-8 gap-y-3 md:grid-cols-2 max-w-3xl">
            {specs.map((s) => (
              <div key={s.label} className="flex items-baseline gap-3 py-2 border-b border-ink-line">
                <span className="text-sm font-semibold text-ink-900 min-w-[140px]">{s.label}</span>
                <span className="text-sm text-ink-500">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Related ─── */}
        {relatedItems.length > 0 && (
          <div className="mt-20">
            <h2 className="h-display text-xl md:text-2xl mb-6">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedItems.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.handle}`}
                  className="tile"
                  style={{ textDecoration: "none" }}
                >
                  <div className="tile-image relative">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 320px, 50vw"
                      style={{ objectFit: "contain", padding: "10%" }}
                    />
                  </div>
                  <div className="tile-body">
                    <div className="text-ink-900 font-semibold text-sm leading-tight line-clamp-2 min-h-[2.6em]">
                      {p.title}
                    </div>
                    <div className="text-ink-900 font-bold">{formatPrice(p.price)}</div>
                    <div className={p.inStock ? "status-in-stock text-xs" : "status-out text-xs"}>
                      {p.inStock ? "En stock" : "Épuisé"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mini add-to-cart — very visible sur mobile */}
      {showSticky && product.inStock && !variantUnavailable && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t"
          style={{
            padding: "0.7rem 1rem",
            borderTopColor: "var(--line)",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.10)",
          }}
        >
          <div className="mx-auto max-w-[1400px] flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900 text-sm truncate">
                {product.title}
              </div>
              <div className="text-xs text-ink-500">
                <span className="font-bold text-ink-900">{formatPrice(totalPrice)}</span>
                {gravure ? " · gravure incluse" : ""}
              </div>
            </div>
            <button
              onClick={onAdd}
              className="shrink-0 inline-flex items-center gap-1.5 font-black uppercase text-xs tracking-widest text-ink-900 transition-transform active:scale-[0.98]"
              style={{
                padding: "0.85rem 1.3rem",
                borderRadius: 999,
                background: "linear-gradient(135deg, #ffdc73 0%, #f0c040 60%, #d9a52d 100%)",
                border: "1px solid #d9a52d",
                boxShadow: "0 4px 14px rgba(240,192,64,0.4)",
                cursor: "pointer",
              }}
            >
              <span className="hidden sm:inline">Ajouter au panier</span>
              <span className="sm:hidden">Ajouter</span>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
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
    <div className="p-4 rounded border border-ink-line bg-[#fafbfc]">
      <div className="text-xs font-semibold uppercase tracking-widest text-status-red mb-1">
        Actuellement épuisé
      </div>
      <div className="text-sm font-semibold text-ink-900 mb-3">
        Prévenez-moi du retour en stock
      </div>
      {submitted ? (
        <p className="text-sm text-ink-500">
          Merci ! Nous vous préviendrons dès que{" "}
          <span className="text-ink-900 font-semibold">{productTitle}</span>{" "}
          sera de nouveau disponible.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim().length > 3) onSubmit();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
            className="flex-1 text-sm px-3 py-2.5 rounded border border-ink-line outline-none focus:border-brand"
          />
          <button type="submit" className="btn-primary">
            Prévenez-moi
          </button>
        </form>
      )}
    </div>
  );
}
