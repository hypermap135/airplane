import FavorisClient from "./FavorisClient";
import { PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Mes favoris — AirplaneStore",
  description: "Retrouvez les maquettes que vous avez ajoutées à votre liste de favoris.",
  robots: { index: false, follow: false },
};

export default function FavorisPage() {
  // We hand the full catalogue down to the client component. The client
  // reads the favorite handles from localStorage and filters server-side
  // data on render — no extra fetch, no flash of empty list.
  const products = PRODUCTS.map((p) => ({
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
    <div className="min-h-screen pt-24 md:pt-32 pb-24" style={{ background: "#06060f" }}>
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex items-center gap-3 mb-8">
          <div aria-hidden style={{ width: 28, height: 1, background: "rgba(226,75,74,0.6)" }} />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              color: "rgba(255,180,180,0.8)",
            }}
          >
            ♥ Vos favoris
          </span>
        </div>

        <h1
          className="font-black text-white mb-10"
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.6rem)",
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          Mes favoris.
        </h1>

        <FavorisClient products={products} />
      </div>
    </div>
  );
}
