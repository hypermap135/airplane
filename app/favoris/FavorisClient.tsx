"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/products";

export default function FavorisClient({ products }: { products: Product[] }) {
  const { items, count } = useWishlist();
  const favorites = products.filter((p) => items.includes(p.handle));

  if (count === 0) {
    return (
      <div className="rounded-md p-10 md:p-14 text-center border border-ink-line bg-[#fafbfc]">
        <div className="text-5xl mb-4" aria-hidden>♡</div>
        <h2 className="text-ink-900 text-xl font-bold mb-2">
          Aucun favori pour l&apos;instant
        </h2>
        <p className="text-ink-500 max-w-md mx-auto mb-6">
          Cliquez sur le cœur d&apos;une maquette pour la sauvegarder ici et
          la retrouver plus tard.
        </p>
        <Link href="/collections/all" className="btn-primary" style={{ textDecoration: "none" }}>
          Voir la collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {favorites.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
