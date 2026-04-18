import { notFound } from "next/navigation";
import CatalogueGrid from "@/components/CatalogueGrid";
import SectionHeading from "@/components/SectionHeading";
import { COLLECTIONS, byCollection, type Collection } from "@/lib/products";

const SUBTITLES: Record<Collection, string> = {
  airbus: "La gamme Airbus : A320, A321, A350, A380 et éditions spéciales.",
  boeing: "Les Boeing iconiques : 737, 747, 777, 787 Dreamliner.",
  concorde: "Le supersonique, en livrées Air France et British Airways.",
  chasse: "Rafale, F-16, Mirage 2000 — l'élite des chasseurs.",
  jet: "Jets privés d'affaires — longue distance, grande classe.",
  packs: "Regroupez plusieurs maquettes et économisez jusqu'à 17€.",
  accessoires: "Porte-clés, horloges, gravures — la touche finale.",
};

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export function generateMetadata({ params }: { params: { collection: string } }) {
  const match = COLLECTIONS.find((c) => c.slug === params.collection);
  if (!match) return { title: "Collection" };
  return {
    title: `${match.label} — Maquettes d'avion en résine`,
    description: SUBTITLES[match.slug],
  };
}

export default function CollectionPage({ params }: { params: { collection: string } }) {
  const match = COLLECTIONS.find((c) => c.slug === params.collection);
  if (!match) notFound();

  const products = byCollection(match.slug);

  return (
    <section className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={`Collection · ${match.label}`}
          title={match.label}
          subtitle={SUBTITLES[match.slug]}
        />
        <div className="mt-10">
          <CatalogueGrid products={products} activeCollection={match.slug} />
        </div>
      </div>
    </section>
  );
}
