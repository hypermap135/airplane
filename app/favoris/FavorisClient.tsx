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
      <div
        className="rounded-2xl p-10 md:p-14 text-center"
        style={{
          background: "linear-gradient(145deg, #0c0c1c 0%, #07070f 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-5xl mb-4" aria-hidden>♡</div>
        <h2 className="text-white text-xl font-bold mb-2">
          Aucun favori pour l&apos;instant
        </h2>
        <p className="text-white/55 max-w-md mx-auto mb-6">
          Cliquez sur le cœur d&apos;une maquette pour la sauvegarder ici et
          la retrouver plus tard.
        </p>
        <Link
          href="/#collection"
          className="inline-flex items-center gap-2 font-semibold transition-transform hover:scale-[1.02]"
          style={{
            background: "#fff",
            color: "#06060f",
            padding: "0.85rem 1.6rem",
            borderRadius: 999,
            fontSize: "0.85rem",
          }}
        >
          Voir la collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {favorites.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
