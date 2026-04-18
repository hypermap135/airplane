"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, related, type Product } from "@/lib/products";
import ProductCard from "./ProductCard";

const SPECS: { label: string; value: string }[] = [
  { label: "Matière", value: "Résine monobloc" },
  { label: "Longueur", value: "~47 cm" },
  { label: "Poids", value: "~1,3 kg" },
  { label: "Socle", value: "Bois massif inclus" },
  { label: "Train d'atterrissage", value: "Amovible (se met ou s'enlève)" },
  { label: "Éclairage", value: "LED ~20 s · interrupteur sous la maquette" },
  { label: "Batterie", value: "Lithium 75 mAh · charge USB ~1h" },
];

export default function ProductDetail({ product }: { product: Product }) {
  const [submitted, setSubmitted] = useState(false);
  const { add } = useCart();
  const { setOpen } = useCartDrawer();

  const onAdd = () => {
    if (!product.inStock) return;
    add(product.variantId, 1);
    setOpen(true);
  };

  const relatedItems = related(product, 4);

  return (
    <section className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <nav className="text-xs text-mute mb-6">
          <Link href="/" className="hover:text-white">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.collection}`} className="hover:text-white capitalize">
            {product.collection}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/70">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="hublot aspect-[4/5] relative">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {!product.inStock && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-ink-900/80 border border-white/15 hud">
                Épuisé
              </div>
            )}
          </div>

          <div>
            <div className="hud text-white/60 capitalize">Collection · {product.collection}</div>
            <h1 className="display mt-3 text-[clamp(1.8rem,4vw,3rem)] leading-tight chrome-text">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="mt-3 text-mute text-base md:text-lg">{product.subtitle}</p>
            )}

            <div className="mt-6 flex items-end gap-4">
              <div className="chrome-text display text-3xl">{formatPrice(product.price)}</div>
              {product.compareAt && (
                <div className="text-mute line-through pb-1">{formatPrice(product.compareAt)}</div>
              )}
            </div>

            <div className="mt-8">
              {product.inStock ? (
                <button onClick={onAdd} className="btn-chrome w-full md:w-auto">
                  Ajouter au panier →
                </button>
              ) : (
                <NotifyForm
                  productTitle={product.title}
                  submitted={submitted}
                  onSubmit={() => setSubmitted(true)}
                />
              )}
            </div>

            <div className="mt-10">
              <div className="hud text-white/60 mb-3">Caractéristiques</div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-ink-border pt-5">
                {SPECS.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 border-b border-ink-border/60 pb-3">
                    <dt className="text-sm text-mute">{s.label}</dt>
                    <dd className="text-sm text-white text-right">{s.value}</dd>
                  </div>
                ))}
                {product.scale && (
                  <div className="flex justify-between gap-4 border-b border-ink-border/60 pb-3">
                    <dt className="text-sm text-mute">Échelle</dt>
                    <dd className="text-sm text-white text-right">{product.scale}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Info icon="🚚" label="Livraison" value="7–15 j" />
              <Info icon="↩" label="Retour" value="30 j" />
              <Info icon="🔒" label="Paiement" value="Sécurisé" />
            </div>
          </div>
        </div>

        {relatedItems.length > 0 && (
          <div className="mt-24">
            <div className="hud text-white/60">Dans la même collection</div>
            <h2 className="display mt-2 text-2xl text-white">Vous aimerez aussi</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-600/50 px-4 py-3">
      <div className="text-xs">{icon}</div>
      <div className="hud text-white/50 mt-1">{label}</div>
      <div className="font-mono text-white text-sm mt-0.5">{value}</div>
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
    <div className="rounded-2xl border border-ink-border bg-ink-600/60 p-5">
      <div className="hud text-led">● ACTUELLEMENT ÉPUISÉ</div>
      <h3 className="display mt-2 text-white text-base">Prévenez-moi du retour en stock</h3>
      {submitted ? (
        <p className="mt-4 text-sm text-white/85">
          Merci, nous vous préviendrons dès que <span className="font-medium">{productTitle}</span>{" "}
          sera de nouveau en stock.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim().length > 3) onSubmit();
          }}
          className="mt-4 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
            className="flex-1 bg-ink-900 border border-ink-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-white/40"
          />
          <button type="submit" className="btn-chrome">Prévenez-moi</button>
        </form>
      )}
    </div>
  );
}
