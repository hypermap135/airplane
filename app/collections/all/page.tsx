import CatalogueGrid from "@/components/CatalogueGrid";
import SectionHeading from "@/components/SectionHeading";
import { getProducts } from "@/lib/products-store";

export const metadata = {
  title: "Collection complète — Maquettes d'avion en résine premium",
  description:
    "Airbus, Boeing, Concorde, Jets privés, Packs et Accessoires. Livraison France & Europe.",
};

export default async function AllCollectionsPage() {
  const products = await getProducts();
  return (
    <section className="pt-28 pb-24" style={{ background: "#010108", minHeight: "100vh" }}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-20">
        <SectionHeading
          eyebrow="Catalogue"
          title="Toute la collection"
          subtitle="Airbus · Boeing · Concorde · Jets privés · Packs · Accessoires."
        />
        <div className="mt-10">
          <CatalogueGrid products={products} />
        </div>
      </div>
    </section>
  );
}
