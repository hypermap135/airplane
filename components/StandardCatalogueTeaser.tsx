"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { formatPrice, type Product } from "@/lib/products";

/**
 * Secondary catalogue teaser — "Nos maquettes standards", positioned AFTER
 * the B2B section per client meeting decision. Shows 8 in-stock products
 * in a compact airmodels-style grid.
 */
export default function StandardCatalogueTeaser({ catalogue }: { catalogue: Product[] }) {
  // Le client a explicitement demandé de "montrer aussi les autres livrées,
  // pas juste Air France" (vidéo 2 du 27/07). On mélange donc AF et non-AF
  // pour que la boutique montre la vraie diversité du catalogue.
  const items = useMemo(() => {
    // NOTE: on garde les variantId === "0" ici — le client a mis en stock
    // 20+ variantes (A350 Singapore/Iberia/Emirates, A380 Singapore,
    // Transavia) qui n'ont pas encore de variant Shopify créé. Le merchant
    // doit les créer côté Shopify Admin, mais en attendant on veut qu'elles
    // soient visibles pour montrer la vraie diversité du catalogue.
    const base = catalogue.filter((p) =>
      p.inStock &&
      !p.comingSoon &&
      p.collection !== "accessoires" &&
      p.collection !== "packs" &&
      !p.bestseller,
    );
    const nonAF = base.filter((p) => !p.title.toLowerCase().includes("air france"));
    const af    = base.filter((p) => p.title.toLowerCase().includes("air france"));
    // Interleave nonAF / AF pour éviter d'avoir 5 AF d'affilée en tête
    const mixed: typeof base = [];
    const n = Math.max(nonAF.length, af.length);
    for (let i = 0; i < n; i++) {
      if (nonAF[i]) mixed.push(nonAF[i]);
      if (af[i])    mixed.push(af[i]);
    }
    return mixed.slice(0, 12);
  }, [catalogue]);

  if (items.length === 0) return null;

  return (
    <section className="bg-white section">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
              Boutique standard
            </div>
            <h2 className="h-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)" }}>
              Achat unitaire — livraison 7–15 jours
            </h2>
            <p className="mt-2 text-ink-500 text-sm md:text-base max-w-2xl">
              Maquettes prêtes à expédier. Livrée standard aux couleurs des
              grandes compagnies.
            </p>
          </div>
          <Link
            href="/collections/all"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
            style={{ textDecoration: "none" }}
          >
            Tout le catalogue →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((p) => (
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
                <div className="text-ink-900 font-bold">
                  {formatPrice(p.price)}
                </div>
                <div className="status-in-stock text-xs">En stock</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 md:hidden text-center">
          <Link href="/collections/all" className="btn-secondary" style={{ textDecoration: "none" }}>
            Tout le catalogue →
          </Link>
        </div>
      </div>
    </section>
  );
}
