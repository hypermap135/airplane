import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import BestSellers from "@/components/BestSellers";
import UniqueFeatures from "@/components/UniqueFeatures";
import PersonalizationSection from "@/components/PersonalizationSection";
import LEDSection from "@/components/LEDSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <BestSellers />
      <UniqueFeatures />
      <PersonalizationSection />
      <LEDSection />
      <CTASection />
    </>
  );
}
