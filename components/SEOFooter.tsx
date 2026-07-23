import Link from "next/link";

/**
 * SEO footer block — keyword-rich paragraph + internal-link mesh, in the
 * new light theme. Server-rendered so crawlers get it on first paint.
 */

const COLLECTIONS_LINKS = [
  { href: "/collections/airbus",      label: "Maquettes Airbus",      detail: "A220, A320, A321, A350, A380" },
  { href: "/collections/boeing",      label: "Maquettes Boeing",      detail: "737, 747, 777, 787 Dreamliner" },
  { href: "/collections/concorde",    label: "Maquettes Concorde",    detail: "Air France · British Airways" },
  { href: "/collections/jet",         label: "Maquettes Jet privé",   detail: "Gulfstream G650 et autres" },
  { href: "/collections/chasse",      label: "Aviation militaire",    detail: "Rafale, Mirage, F16" },
  { href: "/collections/packs",       label: "Packs & offres",        detail: "Bundles Airbus / Boeing / Duo" },
  { href: "/collections/accessoires", label: "Accessoires aviation",  detail: "Porte-clés, horloges, gravures" },
];

const POPULAR_LINKS = [
  { href: "/products/a320-neo",                                   label: "Airbus A320 Air France" },
  { href: "/products/airbus-a220-air-france",                     label: "Airbus A220 Air France" },
  { href: "/products/airbus-a380-air-france",                     label: "Airbus A380 Air France" },
  { href: "/products/boeing-747",                                 label: "Boeing 747 Air France" },
  { href: "/products/boeing-787",                                 label: "Boeing 787 Dreamliner Air France" },
  { href: "/products/concorde-airfrance",                         label: "Concorde Air France 50 cm" },
  { href: "/products/concorde-british",                           label: "Concorde British Airways 50 cm" },
  { href: "/products/jet-prive",                                  label: "Gulfstream G650" },
  { href: "/products/pack-prestige-air-france",                   label: "Pack Prestige Air France" },
];

export default function SEOFooter() {
  return (
    <section
      aria-label="À propos d'AirplaneStore"
      className="bg-[#f6f7fa] border-t border-ink-line"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-14 md:py-16">
        {/* Intro paragraph */}
        <div className="mb-12 max-w-3xl">
          <h2 className="h-display text-xl md:text-2xl mb-4">
            Maquettes d&apos;avion en résine premium · Personnalisation entreprise
          </h2>
          <div className="space-y-3 text-ink-700 text-sm md:text-base leading-relaxed">
            <p>
              <strong className="text-ink-900">AirplaneStore</strong> conçoit et
              édite des maquettes d&apos;avion en résine monobloc, peintes à la
              main et posées sur un socle en bois massif. Chaque pièce intègre
              un éclairage LED activable au tap sur le fuselage ou au clap des
              mains.
            </p>
            <p>
              Notre spécialité : la <strong className="text-ink-900">personnalisation
              d&apos;entreprise à partir de 30 exemplaires</strong> — livrée à
              vos couleurs, gravure de vos noms et logos, écrin avec plaque
              gravée. Idéal cadeau clients, séminaire, remerciement partenaires.
            </p>
            <p>
              Le catalogue standard couvre toute la famille{" "}
              <Link href="/collections/airbus" className="text-brand underline hover:text-brand-dark">Airbus</Link>{" "}
              (A220, A320, A321, A350, A380),{" "}
              <Link href="/collections/boeing" className="text-brand underline hover:text-brand-dark">Boeing</Link>{" "}
              (737, 747, 777, 787 Dreamliner), le{" "}
              <Link href="/collections/concorde" className="text-brand underline hover:text-brand-dark">Concorde</Link>{" "}
              et les{" "}
              <Link href="/collections/jet" className="text-brand underline hover:text-brand-dark">jets privés</Link>.
              Livraison offerte dès 100€. Code{" "}
              <strong className="text-brand">TAKEOFF10</strong> = −10% sur la
              première commande.
            </p>
          </div>
        </div>

        {/* Collections mesh */}
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-4">
            Explorer par collection
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COLLECTIONS_LINKS.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block group"
                  style={{ textDecoration: "none" }}
                >
                  <div className="text-sm font-semibold text-ink-900 group-hover:text-brand transition-colors">
                    {c.label}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">{c.detail}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular products chips */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-4">
            Modèles populaires
          </div>
          <ul className="flex flex-wrap gap-2">
            {POPULAR_LINKS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="inline-block px-3 py-1.5 rounded-full text-xs text-ink-700 bg-white border border-ink-line hover:border-brand hover:text-brand transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
