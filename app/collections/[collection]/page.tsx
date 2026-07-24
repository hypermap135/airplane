import { Suspense } from "react";
import { notFound } from "next/navigation";
import CatalogueGrid from "@/components/CatalogueGrid";
import { COLLECTIONS, type Collection, type Product } from "@/lib/products";
import { getProducts } from "@/lib/products-store";

const SUBTITLES: Record<Collection, string> = {
  airbus:      "A220, A320, A321, A350, A380 — toute la famille Airbus en résine monobloc.",
  boeing:      "737, 747, 777, 787 Dreamliner — les légendes Boeing, dont Air Force One.",
  concorde:    "Le supersonique, en livrées Air France et British Airways. Une pièce hors du temps.",
  chasse:      "Rafale, Mirage 2000, F16 — l'aviation militaire française, coulée dans la résine.",
  jet:         "La grande classe des airs. Jets d'affaires longue distance.",
  packs:       "Deux maquettes ou trois — constituez une collection d'un seul geste.",
  accessoires: "Porte-clés, horloges, gravures — la touche finale pour compléter votre collection.",
};

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

const BASE = "https://airplanestore.fr";

export function generateMetadata({ params }: { params: { collection: string } }) {
  const match = COLLECTIONS.find((c) => c.slug === params.collection);
  if (!match) return { title: "Collection" };
  return {
    title: `${match.label} — Maquettes d'avion en résine`,
    description: SUBTITLES[match.slug],
    alternates: { canonical: `/collections/${match.slug}` },
    openGraph: {
      title: `${match.label} — Maquettes d'avion en résine premium`,
      description: SUBTITLES[match.slug],
      url: `${BASE}/collections/${match.slug}`,
      type: "website",
    },
  };
}

function collectionBreadcrumbLd(slug: Collection, label: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
      { "@type": "ListItem", position: 2, name: label, item: `${BASE}/collections/${slug}` },
    ],
  };
}

function collectionItemListLd(slug: Collection, label: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Maquettes ${label} — AirplaneStore`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: products.length,
    url: `${BASE}/collections/${slug}`,
    itemListElement: products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${BASE}/products/${p.handle}`,
      name: p.title,
    })),
  };
}

export default async function CollectionPage({ params }: { params: { collection: string } }) {
  const match = COLLECTIONS.find((c) => c.slug === params.collection);
  if (!match) notFound();

  const all = await getProducts();
  const products = all.filter((p) => p.collection === match.slug);

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionBreadcrumbLd(match.slug, match.label)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionItemListLd(match.slug, match.label, products)) }}
      />

      {/* ── Compact hero ── */}
      <div className="bg-brand-light border-b border-ink-line">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10 md:py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-2">
            Collection · {match.label}
          </div>
          <h1 className="h-display text-3xl md:text-4xl">{match.label}</h1>
          <p className="mt-3 text-ink-500 max-w-2xl">{SUBTITLES[match.slug]}</p>
        </div>
      </div>

      {/* ── Products grid ── */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-12">
        <Suspense fallback={null}>
          <CatalogueGrid products={products} activeCollection={match.slug} />
        </Suspense>
      </div>
    </div>
  );
}
