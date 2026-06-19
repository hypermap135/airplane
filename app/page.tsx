import HeroV4Carousel from "@/components/HeroV4Carousel";
import TrustBar from "@/components/TrustBar";
import TrustWall from "@/components/TrustWall";
import CustomModelBanner from "@/components/CustomModelBanner";
import BestSellers from "@/components/BestSellers";
import CollectionExplorerV2 from "@/components/CollectionExplorerV2";
import HeroV2BoardingPass from "@/components/HeroV2BoardingPass";
import UniqueFeatures from "@/components/UniqueFeatures";
import LEDSection from "@/components/LEDSection";
import PersonalizationSection from "@/components/PersonalizationSection";
import ManifestoSection from "@/components/ManifestoSection";
import ReviewsSection from "@/components/ReviewsSection";
import CTASection from "@/components/CTASection";
import SEOFooter from "@/components/SEOFooter";

export default function HomePage() {
  return (
    <>
      <HeroV4Carousel />
      <TrustBar />
      <TrustWall />
      {/* Banner "Maquette sur mesure" — teaser juste au-dessus des bestsellers */}
      <CustomModelBanner />
      {/* Notre sélection — 3 bestsellers gold-framed */}
      <BestSellers />
      {/* Toute la flotte — explorer inline avec chips de catégorie */}
      <CollectionExplorerV2 />
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
