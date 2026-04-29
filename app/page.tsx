import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import BestSellers from "@/components/BestSellers";
import ProductShowcase from "@/components/ProductShowcase";
import ReviewsSection from "@/components/ReviewsSection";
import UniqueFeatures from "@/components/UniqueFeatures";
import LEDSection from "@/components/LEDSection";
import PersonalizationSection from "@/components/PersonalizationSection";
import ManifestoSection from "@/components/ManifestoSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import CinematicReveal from "@/components/CinematicReveal";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <StatsSection />
      <BestSellers />
      <ProductShowcase />
      <CinematicReveal />
      <UniqueFeatures />
      <LEDSection />
      <PersonalizationSection />
      <ManifestoSection />
      <ReviewsSection />
      <CTASection />
    </>
  );
}
