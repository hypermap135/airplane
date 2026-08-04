import FAQ from "@/components/FAQ";
import SectionHeading from "@/components/SectionHeading";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "FAQ — Questions fréquentes",
  description: "Livraison, LED, gravure, retour : toutes les réponses sur les maquettes d'avion AirplaneStore.",
  alternates: { canonical: "/faq" },
};

/** FAQPage JSON-LD — lets Google show the questions as expandable
 *  accordions directly in the search result. Massive SERP real estate. */
function buildFaqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
}

export default async function FAQPage() {
  const { faq } = await getSiteContent();
  return (
    <section className="pt-28 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLd(faq)) }}
      />
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          subtitle="Tout ce qu'il faut savoir avant de commander."
        />
        <div className="mt-10">
          <FAQ items={faq} />
        </div>
      </div>
    </section>
  );
}
