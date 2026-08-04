import HeroB2B from "@/components/HeroB2B";
import CorporateShowcase from "@/components/CorporateShowcase";
import BestsellersLight from "@/components/BestsellersLight";
import StandardCatalogueTeaser from "@/components/StandardCatalogueTeaser";
import { getProducts } from "@/lib/products-store";
import { getSiteContent } from "@/lib/site-content";

// Contenu du hero + corporate showcase édités via /admin/contenu
// (fallback data/site-content.json bundlé au build).
export default async function HomePage() {
  const [catalogue, siteContent] = await Promise.all([
    getProducts(),
    getSiteContent(),
  ]);
  return (
    <>
      <HeroB2B content={siteContent.hero} />
      <CorporateShowcase content={siteContent.corporate} />
      <BestsellersLight catalogue={catalogue} />
      <StandardCatalogueTeaser catalogue={catalogue} />
    </>
  );
}
