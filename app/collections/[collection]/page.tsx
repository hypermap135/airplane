import { notFound } from "next/navigation";
import CatalogueGrid from "@/components/CatalogueGrid";

import SectionHeading from "@/components/SectionHeading";
import { COLLECTIONS, byCollection, type Collection } from "@/lib/products";

const SUBTITLES: Record<Collection, string> = {
  airbus: "A220, A320, A321, A350, A380 — toute la famille Airbus en résine monobloc.",
  boeing: "737, 747, 777, 787 Dreamliner — les légendes Boeing, dont Air Force One.",
  concorde: "Le supersonique, en livrées Air France et British Airways. Une pièce hors du temps.",
  chasse: "Rafale, Mirage 2000, F16 — l'aviation militaire française, coulée dans la résine.",
  jet: "La grande classe des airs. Jets d'affaires longue distance — pour les collections d'exception.",
  packs: "Deux maquettes ou trois — constituez une collection d'un seul geste.",
  accessoires: "Porte-clés, horloges, gravures — la touche finale pour compléter votre collection.",
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
    <section className="pt-28 pb-24" style={{ background: "#010108", minHeight: "100vh" }}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20">
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
