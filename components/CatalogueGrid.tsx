"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { COLLECTIONS, type Product, sortForDisplay } from "@/lib/products";

type SortKey = "default" | "asc" | "desc";

export default function CatalogueGrid({
  products,
  activeCollection,
  showFilters = true,
}: {
  products: Product[];
  activeCollection?: string;
  showFilters?: boolean;
}) {
  const [sort, setSort] = useState<SortKey>("default");

  const sorted = useMemo(() => {
    const base = sortForDisplay(products);
    if (sort === "asc") {
      const inStock = base.filter((p) => p.inStock).sort((a, b) => a.price - b.price);
      const out = base.filter((p) => !p.inStock).sort((a, b) => a.price - b.price);
      return [...inStock, ...out];
    }
    if (sort === "desc") {
      const inStock = base.filter((p) => p.inStock).sort((a, b) => b.price - a.price);
      const out = base.filter((p) => !p.inStock).sort((a, b) => b.price - a.price);
      return [...inStock, ...out];
    }
    return base;
  }, [products, sort]);

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-border pb-5">
          <div className="flex flex-wrap gap-2">
            <FilterChip href="/collections/all" active={!activeCollection}>
              Tout
            </FilterChip>
            {COLLECTIONS.map((c) => (
              <FilterChip
                key={c.slug}
                href={`/collections/${c.slug}`}
                active={activeCollection === c.slug}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm text-mute">
            <span className="hud text-white/50">Trier</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-ink-600 border border-ink-border rounded-full px-4 py-2 text-white/90 text-sm outline-none focus:border-white/40"
            >
              <option value="default">Défaut</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </label>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="mt-16 text-center text-mute">Aucun produit dans cette collection.</div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium tracking-wide transition ${
        active
          ? "bg-chrome-grad text-ink-900 border border-transparent"
          : "border border-ink-border text-white/75 hover:text-white hover:border-white/30"
      }`}
    >
      {children}
    </Link>
  );
}
