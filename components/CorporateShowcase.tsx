import Link from "next/link";

/**
 * "Nos réalisations entreprises" — placeholder social proof section for
 * the B2B custom-order pivot. Uses text logos + a short case study line.
 * Client will replace with real logos / real cases when available.
 */
const LOGOS = [
  "Air France", "Airbus", "Dassault", "Safran", "ATR", "Groupe ADP",
];

const CASES = [
  {
    company: "Cadeau clients — série sur mesure",
    detail: "Airbus A320 aux couleurs de leur compagnie, plaque gravée nominative.",
  },
  {
    company: "Séminaire annuel — édition événement",
    detail: "Boeing 787 mini-format, écrin premium, remise sur estrade.",
  },
  {
    company: "Remerciement partenaires — édition limitée",
    detail: "Concorde édition limitée, gravure logo + année.",
  },
];

export default function CorporateShowcase() {
  return (
    <section className="bg-[#f6f7fa] border-y border-ink-line section">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        {/* Section head */}
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            Ils nous ont fait confiance
          </div>
          <h2 className="h-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)" }}>
            Forfait entreprise sur devis, 100% sur-mesure.
          </h2>
          <p className="mt-3 text-ink-500">
            Cadeaux clients, séminaires, événements — nous produisons des
            maquettes personnalisées pour les compagnies aériennes,
            constructeurs et prestataires du secteur aéronautique.
          </p>
        </div>

        {/* Logos strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 pb-10 md:pb-14 border-b border-ink-line">
          {LOGOS.map((l) => (
            <span
              key={l}
              className="text-ink-300 text-sm md:text-base font-semibold uppercase tracking-wider"
            >
              {l}
            </span>
          ))}
        </div>

        {/* Cases */}
        <div className="grid gap-6 md:grid-cols-3 pt-10 md:pt-14">
          {CASES.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-ink-line rounded-md p-6"
            >
              <div className="text-brand text-xs font-semibold uppercase tracking-widest mb-2">
                Cas #{i + 1}
              </div>
              <div className="text-ink-900 font-semibold text-lg mb-2">
                {c.company}
              </div>
              <div className="text-ink-500 text-sm leading-relaxed">
                {c.detail}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14 text-center">
          <Link href="/contact" className="btn-primary" style={{ textDecoration: "none" }}>
            Recevoir un devis personnalisé →
          </Link>
          <div className="mt-3 text-xs text-ink-500">
            Réponse sous 24h · devis gratuit et sans engagement
          </div>
        </div>
      </div>
    </section>
  );
}
