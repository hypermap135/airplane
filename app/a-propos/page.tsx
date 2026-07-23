import Link from "next/link";

export const metadata = {
  title: "À propos — AirplaneStore, la maison",
  description:
    "AirplaneStore : maquettes d'avion personnalisées à partir de 30 exemplaires, résine monobloc peinte main, pensées et éditées en France.",
  alternates: { canonical: "/a-propos" },
};

const PILLARS = [
  {
    n: "01", eyebrow: "Personnalisation",
    title: "Sur-mesure à partir de 30 exemplaires.",
    body:
      "Nous produisons des maquettes personnalisées pour entreprises : livrée à vos couleurs, gravure de vos noms et logos, écrin avec plaque gravée. Idéal cadeau clients, séminaire, remerciement partenaires.",
  },
  {
    n: "02", eyebrow: "Fabrication",
    title: "Résine monobloc, peinte main.",
    body:
      "Pièces coulées d'un seul tenant en résine haute densité, puis peintes à la main couche par couche. Pas de plastique injecté, pas de décals — la finition est conçue pour traverser les décennies.",
  },
  {
    n: "03", eyebrow: "Éclairage",
    title: "LED activable au tap.",
    body:
      "Un système discret intégré dans le socle. Une tape sur le bois, et la cabine s'illumine. Batterie 75 mAh rechargeable en USB, auto-off après ~20 secondes.",
  },
  {
    n: "04", eyebrow: "Gravure",
    title: "Gravure laser au socle.",
    body:
      "Pour 15 € de plus sur les modèles standards. Sur commande entreprise : incluse. Une immatriculation, un numéro de vol, un événement — la maquette devient une pièce unique.",
  },
];

const TIMELINE = [
  { year: "2023", event: "Lancement d'AirplaneStore — Airbus A380 Air France comme premier modèle." },
  { year: "2024", event: "Élargissement à la collection Boeing — 747, 777, 787 Dreamliner." },
  { year: "2025", event: "Ajout du Concorde, des jets privés et des packs collection." },
  { year: "2026", event: "Pivot vers la personnalisation d'entreprise à partir de 30 exemplaires." },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* ── HERO ── */}
      <section className="bg-brand-light border-b border-ink-line">
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-14 md:py-20">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-3">
            ★ La maison AirplaneStore
          </div>
          <h1 className="h-display text-3xl md:text-5xl mb-5">
            Des sculptures plutôt que des jouets.
          </h1>
          <p className="text-ink-500 leading-relaxed max-w-2xl">
            AirplaneStore est né d&apos;une obsession : éditer des répliques
            d&apos;avion à la hauteur des appareils qu&apos;elles représentent.
            Résine monobloc, peinture main, socle bois, LED intégré — chaque
            pièce est pensée pour durer.
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-14 md:py-20">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
          Notre histoire
        </div>
        <h2 className="h-display text-2xl md:text-3xl mb-6">
          De l&apos;idée à 30+ modèles au catalogue.
        </h2>
        <div className="space-y-4 text-ink-700 leading-relaxed">
          <p>
            Nous avons commencé par une frustration : impossible de trouver une
            maquette de l&apos;A380 Air France qui rende justice à cet avion.
            Trop de plastique, trop d&apos;assemblage, trop peu de soin sur les
            finitions. Les modèles vraiment beaux étaient soit hors de prix
            (1 500 € et plus chez les éditeurs spécialisés), soit réservés aux
            flottes commerciales.
          </p>
          <p>
            Nous avons donc lancé AirplaneStore avec une idée claire : produire
            des maquettes au niveau de finition des modèles haut de gamme, mais
            à un prix qui les rend offrables. Résine monobloc plutôt
            qu&apos;assemblage, peinture à la main plutôt que décals
            industriels, socle bois plutôt que plastique, LED intégré plutôt
            qu&apos;option.
          </p>
          <p>
            Aujourd&apos;hui, nous éditons aussi des séries personnalisées pour
            entreprises — 30 exemplaires minimum, livrée à vos couleurs, plaque
            gravée. Cadeaux clients, remerciement partenaires, événements.
          </p>
        </div>
      </section>

      {/* ── 4 PILLARS ── */}
      <section className="bg-[#f6f7fa] border-y border-ink-line section">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            Ce qui change tout
          </div>
          <h2 className="h-display text-2xl md:text-3xl mb-10">
            Quatre choix qui font la différence.
          </h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            {PILLARS.map((p) => (
              <div key={p.n} className="rounded-md bg-white border border-ink-line p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-brand font-bold text-sm">{p.n}</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                    {p.eyebrow}
                  </span>
                </div>
                <h3 className="text-ink-900 font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-14 md:py-20">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
          Chronologie
        </div>
        <h2 className="h-display text-2xl md:text-3xl mb-10">Trois ans d&apos;atelier.</h2>
        <ol className="relative space-y-5 md:space-y-6 pl-6 md:pl-8 border-l border-ink-line">
          {TIMELINE.map((t, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.55rem] md:-left-[2.05rem] top-1.5 w-3 h-3 rounded-full bg-brand"
                style={{ boxShadow: "0 0 0 4px var(--brand-blue-light)" }}
              />
              <div className="flex items-baseline gap-4">
                <span className="font-bold text-brand text-sm">{t.year}</span>
                <span className="text-ink-700 text-sm md:text-base">{t.event}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#f6f7fa] border-t border-ink-line section">
        <div className="mx-auto max-w-3xl px-4 md:px-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
            ✈ Une question, une demande spéciale ?
          </div>
          <h2 className="h-display text-2xl md:text-3xl mb-4">
            On vous répond sous 24 h.
          </h2>
          <p className="text-ink-500 mb-8 mx-auto max-w-lg">
            Par email, WhatsApp ou via le formulaire de contact. Une livrée
            précise, une gravure, un délai serré — on trouve une solution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-primary" style={{ textDecoration: "none" }}>
              Nous contacter →
            </Link>
            <Link href="/collections/all" className="btn-secondary" style={{ textDecoration: "none" }}>
              Voir la collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
