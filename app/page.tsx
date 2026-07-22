import HeroV4Carousel from "@/components/HeroV4Carousel";
import TrustBar from "@/components/TrustBar";
import TrustWall from "@/components/TrustWall";
import CustomModelBanner from "@/components/CustomModelBanner";
import BestSellers from "@/components/BestSellers";
import FleetCarousel from "@/components/FleetCarousel";
import HeroV2BoardingPass from "@/components/HeroV2BoardingPass";
import UniqueFeatures from "@/components/UniqueFeatures";
import LEDSection from "@/components/LEDSection";
import PersonalizationSection from "@/components/PersonalizationSection";
import ManifestoSection from "@/components/ManifestoSection";
import ReviewsSection from "@/components/ReviewsSection";
import CTASection from "@/components/CTASection";
import SEOFooter from "@/components/SEOFooter";
import { getProducts } from "@/lib/products-store";

export default async function HomePage() {
  const catalogue = await getProducts();
  return (
    <>
      <HeroV4Carousel />
      <TrustBar />
      <TrustWall />
      {/* Banner "Maquette sur mesure" — teaser juste au-dessus des bestsellers */}
      <CustomModelBanner />
      {/* Notre sélection — 3 bestsellers gold-framed */}
      <BestSellers catalogue={catalogue} />
      {/* Toute la flotte — filterable horizontal scroll, in-stock only */}
      <FleetCarousel catalogue={catalogue} />
      {/* Boarding Pass — bloc standalone entre les produits et les features */}
      <HeroV2BoardingPass />
      <UniqueFeatures />
      <LEDSection />
      <PersonalizationSection />
      <ManifestoSection />
      <ReviewsSection />
      <CTASection />
      {/* SEO footer — keyword-rich paragraph + internal-link mesh.
          Renders server-side so it's in the initial HTML for crawlers. */}
      <SEOFooter />
    </>
  );
}
