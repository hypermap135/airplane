import FavorisClient from "./FavorisClient";
import { getProducts } from "@/lib/products-store";

export const metadata = {
  title: "Mes favoris — AirplaneStore",
  description: "Retrouvez les maquettes que vous avez ajoutées à votre liste de favoris.",
  robots: { index: false, follow: false },
};

export default async function FavorisPage() {
  const catalogue = await getProducts();
  const products = catalogue.map((p) => ({
    handle: p.handle,
    title: p.title,
    subtitle: p.subtitle,
    price: p.price,
    compareAt: p.compareAt,
    image: p.image,
    inStock: p.inStock,
    comingSoon: p.comingSoon,
    bestseller: p.bestseller,
    collection: p.collection,
    id: p.id,
    variantId: p.variantId,
  }));

  return (
    <div className="bg-white min-h-screen">
      {/* ── Compact hero ── */}
      <div className="bg-brand-light border-b border-ink-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10 md:py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-2">
            ♥ Vos favoris
          </div>
          <h1 className="h-display text-3xl md:text-4xl">Mes favoris</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-12">
        <FavorisClient products={products} />
      </div>
    </div>
  );
}
