import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import BestSellers from "@/components/BestSellers";
import ReviewsSection from "@/components/ReviewsSection";
import UniqueFeatures from "@/components/UniqueFeatures";
import LEDSection from "@/components/LEDSection";
import PersonalizationSection from "@/components/PersonalizationSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <StatsSection />
      <BestSellers />
      <UniqueFeatures />
      <LEDSection />
      <PersonalizationSection />
      <ReviewsSection />
      <CTASection />
    </>
  );
}
