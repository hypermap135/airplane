import Link from "next/link";

/**
 * SEO footer block — a final content section before the global <Footer />.
 *
 * Goals:
 *   - High-density keyword paragraph for crawlers without harming UX
 *     (kept visually subtle, low-key for human visitors).
 *   - Internal-link mesh that points to every collection page so PageRank
 *     flows from the homepage to category pages.
 *   - Server component (no "use client") so the markup is in the initial
 *     HTML payload and crawlable on first paste.
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
      className="relative overflow-hidden"
      style={{ background: "#020208" }}
    >
      {/* Top rim */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(58,142,255,0.15), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-12 py-16 md:py-20">
        {/* Intro paragraph — keyword-rich but readable */}
        <div className="mb-14">
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "-0.01em",
            }}
          >
            Maquettes d&apos;avion en résine premium · Fait en France
          </h2>
          <div
            className="space-y-4 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.93rem", maxWidth: 760 }}
          >
            <p>
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>AirplaneStore</strong> conçoit et édite des
              maquettes d&apos;avion en résine monobloc, peintes à la main et posées sur un socle
              en bois massif. Chaque pièce intègre un éclairage LED activable au tap sur le fuselage
              ou au clap des mains — une vingtaine de secondes de lumière studio, puis extinction
              automatique pour préserver la batterie lithium rechargeable par USB.
            </p>
            <p>
              Notre catalogue couvre toute la famille
              {" "}<Link href="/collections/airbus" className="underline hover:text-white">Airbus</Link>
              {" "}(A220, A320, A321, A350, A380),
              {" "}<Link href="/collections/boeing" className="underline hover:text-white">Boeing</Link>
              {" "}(737, 747, 777, 787 Dreamliner, Air Force One), le légendaire
              {" "}<Link href="/collections/concorde" className="underline hover:text-white">Concorde</Link>
              {" "}en livrées Air France et British Airways, et les
              {" "}<Link href="/collections/jet" className="underline hover:text-white">jets privés</Link>
              {" "}comme le Gulfstream G650. Échelles 1/85 à 1/200 selon les modèles, 30 à 50 cm
              d&apos;envergure.
            </p>
            <p>
              Livraison suivie et offerte dès 100€ d&apos;achat en France, Belgique, Suisse, Luxembourg
              et toute l&apos;Union européenne. Satisfait ou remboursé pendant 30 jours. Code{" "}
              <strong style={{ color: "rgba(255,180,77,0.85)" }}>TAKEOFF10</strong> = −10% sur votre
              première commande.
            </p>
          </div>
        </div>

        {/* Internal-link mesh — collections */}
        <div className="mb-12">
          <h3
            className="font-mono uppercase mb-5"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              color: "rgba(58,142,255,0.6)",
            }}
          >
            Explorer par collection
          </h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
            {COLLECTIONS_LINKS.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block group"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <div className="text-[0.86rem] font-semibold group-hover:text-white transition-colors">
                    {c.label}
                  </div>
                  <div
                    className="text-[0.7rem] mt-0.5"
                    style={{ color: "rgba(255,255,255,0.32)" }}
                  >
                    {c.detail}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Internal-link mesh — popular products */}
        <div>
          <h3
            className="font-mono uppercase mb-5"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              color: "rgba(58,142,255,0.6)",
            }}
          >
            Modèles populaires
          </h3>
          <ul className="flex flex-wrap gap-x-3 gap-y-2">
            {POPULAR_LINKS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="inline-block px-3 py-1.5 rounded-full text-[0.74rem] transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)",
                  }}
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
