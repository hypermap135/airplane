"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { setOpen } = useCartDrawer();

  const onAdd = () => {
    if (!product.inStock) return;
    add(product.variantId, 1);
    setOpen(true);
  };

  return (
    <article className="card-chrome group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="hublot aspect-[4/3] relative">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover opacity-90 group-hover:opacity-100 transition"
          />
          {!product.inStock && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-900/80 border border-white/15 hud text-white/80">
              Épuisé
            </div>
          )}
          {product.compareAt && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-chrome-grad text-ink-900 hud">
              –{Math.round(100 - (product.price / product.compareAt) * 100)}%
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.handle}`}>
              <h3 className="display text-[0.82rem] text-white leading-snug hover:text-chrome-200 transition">
                {product.title}
              </h3>
            </Link>
            {product.subtitle && (
              <p className="mt-1.5 text-xs text-mute line-clamp-1">{product.subtitle}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="chrome-text display text-[0.95rem]">{formatPrice(product.price)}</div>
            {product.compareAt && (
              <div className="text-[0.72rem] text-mute line-through">
                {formatPrice(product.compareAt)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {product.inStock ? (
            <button onClick={onAdd} className="btn-ghost flex-1 justify-center">
              Ajouter
            </button>
          ) : (
            <Link href={`/products/${product.handle}`} className="btn-ghost flex-1 justify-center">
              Prévenez-moi
            </Link>
          )}
          <Link
            href={`/products/${product.handle}`}
            className="btn-ghost px-3"
            aria-label="Voir le produit"
          >
            →
          </Link>
        </div>
      </div>
    </article>
  );
}
