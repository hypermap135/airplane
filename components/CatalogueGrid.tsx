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
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Collection filters */}
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

          {/* Sort */}
          <label className="flex items-center gap-3">
            <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: "#3a4055" }}>
              Trier
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-[0.78rem] outline-none cursor-pointer"
              style={{
                background: "rgba(12,12,26,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "0.5rem 1rem",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              <option value="default">Défaut</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </label>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="mt-20 text-center">
          <div className="font-mono text-[0.65rem] tracking-[0.25em] uppercase" style={{ color: "#3a4055" }}>
            Aucun produit dans cette collection
          </div>
        </div>
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
      className="inline-flex items-center font-mono text-[0.6rem] tracking-[0.16em] uppercase transition-all duration-200"
      style={{
        padding: "0.45rem 1rem",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(255,255,255,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "linear-gradient(135deg, #d0d4da 0%, #f0f2f5 50%, #ffffff 100%)"
          : "rgba(255,255,255,0.03)",
        color: active ? "#010108" : "rgba(255,255,255,0.45)",
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </Link>
  );
}
