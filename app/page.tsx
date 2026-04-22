import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ManifestoSection from "@/components/ManifestoSection";
import BestSellers from "@/components/BestSellers";
import UniqueFeatures from "@/components/UniqueFeatures";
import PersonalizationSection from "@/components/PersonalizationSection";
import LEDSection from "@/components/LEDSection";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ManifestoSection />
      <BestSellers />
      <UniqueFeatures />
      <LEDSection />
      <PersonalizationSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
