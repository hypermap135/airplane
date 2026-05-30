import FAQ from "@/components/FAQ";
import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "FAQ — Questions fréquentes",
  description: "Livraison, LED, gravure, retour : toutes les réponses sur les maquettes d'avion AirplaneStore.",
  alternates: { canonical: "/faq" },
};

const ITEMS = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "7 à 15 jours ouvrés en France, Belgique et Suisse. Livraison suivie et offerte dès 100€ d'achat. Nous expédions également dans toute l'Europe.",
  },
  {
    q: "En quel matériau sont vos maquettes ?",
    a: "Résine monobloc, coulée d'une seule pièce puis peinte à la main. Ce matériau offre un rendu très détaillé, tout en restant plus léger qu'une maquette métallique.",
  },
  {
    q: "Comment fonctionne l'éclairage LED ?",
    a: "L'éclairage s'active de deux façons : un tap sur le fuselage, ou un clap des mains à proximité de l'avion. Le fuselage et le cockpit s'allument pendant environ 20 secondes — puis l'éclairage s'éteint automatiquement pour préserver la durée de vie de la batterie lithium 75 mAh. Recharge par USB, câble fourni, temps de charge ~1h.",
  },
  {
    q: "Le train d'atterrissage est-il amovible ?",
    a: "Oui, le train d'atterrissage est amovible : il se met ou s'enlève selon l'angle d'exposition souhaité (posé ou en vol).",
  },
  {
    q: "Puis-je personnaliser ma maquette ?",
    a: "Oui, nous proposons la gravure laser sur le socle en bois (+15€) : nom, date, immatriculation, dédicace.",
  },
  {
    q: "Quelle est votre politique de retour ?",
    a: "Satisfait ou remboursé 30 jours. Retour offert depuis la France. La maquette doit être retournée dans sa boîte d'origine, en parfait état.",
  },
  {
    q: "Puis-je commander sans créer de compte ?",
    a: "Oui, le checkout invité est activé : vous pouvez finaliser votre commande sans ouvrir de compte client.",
  },
  {
    q: "Avez-vous un code promo ?",
    a: "Oui, le code TAKEOFF10 offre 10% de réduction sur la première commande.",
  },
];

/** FAQPage JSON-LD — lets Google show the questions as expandable
 *  accordions directly in the search result. Massive SERP real estate. */
const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ITEMS.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: it.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <section className="pt-28 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          subtitle="Tout ce qu'il faut savoir avant de commander."
        />
        <div className="mt-10">
          <FAQ items={ITEMS} />
        </div>
      </div>
    </section>
  );
}
