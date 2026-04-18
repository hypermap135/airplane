import Link from "next/link";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";
import { PRODUCTS } from "@/lib/products";

export default function BestSellers() {
  const bestsellers = PRODUCTS.filter((p) => p.bestseller && p.inStock).slice(0, 4);

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Bestsellers"
          title="Les modèles préférés des passionnés"
          subtitle="Quatre pièces iconiques qui partent le plus souvent — toutes en stock."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/collections/all" className="btn-chrome">
            Voir toute la collection →
          </Link>
        </div>
      </div>
    </section>
  );
}
