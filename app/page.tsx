import HeroB2B from "@/components/HeroB2B";
import CorporateShowcase from "@/components/CorporateShowcase";
import BestsellersLight from "@/components/BestsellersLight";
import StandardCatalogueTeaser from "@/components/StandardCatalogueTeaser";
import SEOFooter from "@/components/SEOFooter";
import { getProducts } from "@/lib/products-store";

export default async function HomePage() {
  const catalogue = await getProducts();
  return (
    <>
      <HeroB2B />
      <CorporateShowcase />
      <BestsellersLight catalogue={catalogue} />
      <StandardCatalogueTeaser catalogue={catalogue} />
      <SEOFooter />
    </>
  );
}
