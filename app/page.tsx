import HeroB2B from "@/components/HeroB2B";
import CorporateShowcase from "@/components/CorporateShowcase";
import BestsellersLight from "@/components/BestsellersLight";
import StandardCatalogueTeaser from "@/components/StandardCatalogueTeaser";
import { getProducts } from "@/lib/products-store";

// SEOFooter retiré 27/07/2026 (feedback client — pavé texte parasite).
// Le SEO est déjà porté par les fiches produits (JSON-LD Product), les
// collections (ItemList) et le sitemap.xml.
export default async function HomePage() {
  const catalogue = await getProducts();
  return (
    <>
      <HeroB2B />
      <CorporateShowcase />
      <BestsellersLight catalogue={catalogue} />
      <StandardCatalogueTeaser catalogue={catalogue} />
    </>
  );
}
