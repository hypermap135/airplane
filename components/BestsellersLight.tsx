"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { formatPrice, type Product } from "@/lib/products";

/**
 * Airmodels-style bestsellers grid. 4 tiles max, in-stock only, sorted
 * server-side upstream. Fond blanc, image sur gris clair, bouton ADD TO
 * CART noir plein — pas de survol dramatique, pas d'animation.
 */
export default function BestsellersLight({ catalogue }: { catalogue: Product[] }) {
  const items = useMemo(() => {
    return catalogue
      .filter((p) => p.inStock && p.bestseller && p.variantId !== "0")
      .slice(0, 4);
  }, [catalogue]);

  if (items.length === 0) return null;

  return (
    <section id="bestsellers" className="bg-white section">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
              Nos best-sellers
            </div>
            <h2 className="h-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)" }}>
              Maquettes les plus vendues
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
            style={{ textDecoration: "none" }}
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((p) => (
            <BestsellerCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-8 md:hidden text-center">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
            style={{ textDecoration: "none" }}
          >
            Voir tout →
          </Link>
        </div>
      </div>
    </section>
  );
}

function BestsellerCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="tile"
      style={{ textDecoration: "none" }}
    >
      <div className="tile-image relative">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 320px, 50vw"
          style={{ objectFit: "contain", padding: "10%" }}
        />
        {product.bestseller && (
          <span className="badge-featured absolute top-3 left-3 text-[11px]">
            <span aria-hidden>★</span> Featured
          </span>
        )}
      </div>
      <div className="tile-body">
        <div className="text-ink-900 font-semibold text-sm md:text-base leading-tight line-clamp-2">
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
        <div className={product.inStock ? "status-in-stock" : "status-out"}>
          {product.inStock ? "En stock" : "Épuisé"}
        </div>
        <button
          type="button"
          className="btn-primary mt-2 w-full text-xs"
          onClick={(e) => {
            // The card itself navigates. Prevent double-nav then let the parent
            // <Link> handle it via a manual push — keeps the whole tile clickable
            // while still giving the CTA a "real button" affordance.
            e.preventDefault();
            window.location.href = `/products/${product.handle}`;
          }}
        >
          Ajouter au panier
        </button>
      </div>
    </Link>
  );
}
