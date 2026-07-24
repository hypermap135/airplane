"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const [sort, setSort]   = useState<SortKey>("default");
  const [stock, setStock] = useState<StockKey>("all");
  const [price, setPrice] = useState<PriceKey>("all");
  const searchParams = useSearchParams();
  const urlQ = searchParams?.get("q") ?? "";
  const [manualQ, setManualQ] = useState<string | null>(null);
  const q = manualQ ?? urlQ;
  const setQ = (v: string) => setManualQ(v);

  const filtered = useMemo(() => {
    let res = products;
    const needle = q.trim().toLowerCase();
    if (needle) {
      res = res.filter((p) => {
        const hay = [p.title, p.subtitle ?? "", p.collection, p.handle].join(" ").toLowerCase();
        return hay.includes(needle);
      });
    }
    if (stock === "in-stock") res = res.filter((p) => p.inStock);
    if (price === "lt50")     res = res.filter((p) => p.price < 50);
    if (price === "50-100")   res = res.filter((p) => p.price >= 50 && p.price <= 100);
    if (price === "gt100")    res = res.filter((p) => p.price > 100);
    return res;
  }, [products, stock, price, q]);

  const sorted = useMemo(() => {
    const base = sortForDisplay(filtered);
    if (sort === "asc") {
      const inStock = base.filter((p) => p.inStock).sort((a, b) => a.price - b.price);
      const out     = base.filter((p) => !p.inStock).sort((a, b) => a.price - b.price);
      return [...inStock, ...out];
    }
    if (sort === "desc") {
      const inStock = base.filter((p) => p.inStock).sort((a, b) => b.price - a.price);
      const out     = base.filter((p) => !p.inStock).sort((a, b) => b.price - a.price);
      return [...inStock, ...out];
    }
    return base;
  }, [filtered, sort]);

  const activeFilterCount = (stock !== "all" ? 1 : 0) + (price !== "all" ? 1 : 0);

  return (
    <div>
      {q && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-ink-500">Recherche :</span>
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "var(--brand-blue-light)", color: "var(--brand-blue-dark)" }}
          >
            « {q} »
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Effacer la recherche"
              className="text-brand-dark hover:text-brand"
              style={{ background: "none", border: 0, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
            >
              ✕
            </button>
          </span>
        </div>
      )}
      {showFilters && (
        <div className="pb-5 mb-6 border-b border-ink-line space-y-4">
          {/* Collection chips + sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <ChipLink href="/collections/all" active={!activeCollection}>Tout</ChipLink>
              {COLLECTIONS.map((c) => (
                <ChipLink
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  active={activeCollection === c.slug}
                >
                  {c.label}
                </ChipLink>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-500">Trier :</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="text-sm outline-none cursor-pointer bg-white text-ink-900 border border-ink-line rounded px-2.5 py-1.5 focus:border-brand"
              >
                <option value="default">Défaut</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </label>
          </div>

          {/* Stock + price pills */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-500">Stock</span>
              <ChipButton active={stock === "all"} onClick={() => setStock("all")}>Tous</ChipButton>
              <ChipButton active={stock === "in-stock"} onClick={() => setStock("in-stock")}>Disponibles</ChipButton>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-ink-500">Prix</span>
              <ChipButton active={price === "all"}    onClick={() => setPrice("all")}>Tous</ChipButton>
              <ChipButton active={price === "lt50"}   onClick={() => setPrice("lt50")}>&lt; 50€</ChipButton>
              <ChipButton active={price === "50-100"} onClick={() => setPrice("50-100")}>50–100€</ChipButton>
              <ChipButton active={price === "gt100"}  onClick={() => setPrice("gt100")}>&gt; 100€</ChipButton>
            </div>

            <div className="ml-auto flex items-center gap-3 text-xs text-ink-500">
              <span>{sorted.length} résultat{sorted.length > 1 ? "s" : ""}</span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setStock("all"); setPrice("all"); }}
                  className="text-brand hover:text-brand-dark underline"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="mt-16 text-center space-y-4">
          <div className="text-ink-500 text-sm">
            Aucun produit ne correspond à ces filtres.
          </div>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => { setStock("all"); setPrice("all"); }}
              className="btn-secondary"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChipLink({
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
      className="inline-flex items-center text-xs font-semibold uppercase tracking-wider transition-colors rounded-full"
      style={{
        padding: "0.45rem 1rem",
        border: active ? "1px solid var(--brand-blue)" : "1px solid var(--line)",
        background: active ? "var(--brand-blue)" : "#fff",
        color: active ? "#fff" : "var(--ink-700)",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

function ChipButton({
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
      type="button"
      onClick={onClick}
      className="inline-flex items-center text-xs font-semibold uppercase tracking-wider transition-colors rounded-full"
      style={{
        padding: "0.4rem 0.85rem",
        border: active ? "1px solid var(--brand-blue)" : "1px solid var(--line)",
        background: active ? "var(--brand-blue-light)" : "#fff",
        color: active ? "var(--brand-blue-dark)" : "var(--ink-500)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
