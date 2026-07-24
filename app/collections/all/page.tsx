import { Suspense } from "react";
import CatalogueGrid from "@/components/CatalogueGrid";
import { getProducts } from "@/lib/products-store";

export const metadata = {
  title: "Collection complète — Maquettes d'avion en résine premium",
  description:
    "Airbus, Boeing, Concorde, Jets privés, Packs et Accessoires. Livraison France & Europe.",
};

export default async function AllCollectionsPage() {
  const products = await getProducts();
  return (
    <div className="bg-white min-h-screen">
      {/* ── Compact hero ── */}
      <div className="bg-brand-light border-b border-ink-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10 md:py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-2">
            Catalogue
          </div>
          <h1 className="h-display text-3xl md:text-4xl">Toute la collection</h1>
          <p className="mt-3 text-ink-500 max-w-2xl">
            Airbus · Boeing · Concorde · Jets privés · Packs · Accessoires.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-12">
        <Suspense fallback={null}>
          <CatalogueGrid products={products} />
        </Suspense>
      </div>
    </div>
  );
}
