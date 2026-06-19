"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { COLLECTIONS, type Product, sortForDisplay } from "@/lib/products";

type SortKey = "default" | "asc" | "desc";
type StockKey = "all" | "in-stock";
type PriceKey = "all" | "lt50" | "50-100" | "gt100";

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
  const [stock, setStock] = useState<StockKey>("all");
  const [price, setPrice] = useState<PriceKey>("all");

  const filtered = useMemo(() => {
    let res = products;
    if (stock === "in-stock") res = res.filter((p) => p.inStock);
    if (price === "lt50")     res = res.filter((p) => p.price < 50);
    if (price === "50-100")   res = res.filter((p) => p.price >= 50 && p.price <= 100);
    if (price === "gt100")    res = res.filter((p) => p.price > 100);
    return res;
  }, [products, stock, price]);

  const sorted = useMemo(() => {
    const base = sortForDisplay(filtered);
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
  }, [filtered, sort]);

  const activeFilterCount =
    (stock !== "all" ? 1 : 0) + (price !== "all" ? 1 : 0);

  return (
    <div>
      {showFilters && (
        <div
          className="pb-6 mb-2 space-y-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* ── Collection filters + sort (existing row) ────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
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

          {/* ── Stock + price filter row ────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: "#3a4055" }}>
                Stock
              </span>
              <PillButton active={stock === "all"} onClick={() => setStock("all")}>
                Tous
              </PillButton>
              <PillButton active={stock === "in-stock"} onClick={() => setStock("in-stock")}>
                Disponibles
              </PillButton>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: "#3a4055" }}>
                Prix
              </span>
              <PillButton active={price === "all"}    onClick={() => setPrice("all")}>Tous</PillButton>
              <PillButton active={price === "lt50"}   onClick={() => setPrice("lt50")}>&lt; 50€</PillButton>
              <PillButton active={price === "50-100"} onClick={() => setPrice("50-100")}>50–100€</PillButton>
              <PillButton active={price === "gt100"}  onClick={() => setPrice("gt100")}>&gt; 100€</PillButton>
            </div>

            {/* Result count + reset */}
            <div className="ml-auto flex items-center gap-3">
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setStock("all"); setPrice("all"); }}
                  className="font-mono text-[0.58rem] tracking-[0.2em] uppercase transition"
                  style={{
                    color: "rgba(58,142,255,0.85)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    textDecoration: "underline",
                  }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="mt-20 text-center space-y-4">
          <div className="font-mono text-[0.65rem] tracking-[0.25em] uppercase" style={{ color: "#3a4055" }}>
            Aucun produit ne correspond à ces filtres
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setStock("all"); setPrice("all"); }}
              className="btn-ghost"
            >
              Réinitialiser les filtres
            </button>
          )}
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

function PillButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center font-mono text-[0.58rem] tracking-[0.16em] uppercase transition-all duration-200"
      style={{
        padding: "0.4rem 0.85rem",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(58,142,255,0.45)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "rgba(58,142,255,0.14)"
          : "rgba(255,255,255,0.03)",
        color: active ? "rgba(120,180,255,1)" : "rgba(255,255,255,0.5)",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
