import Link from "next/link";

export const metadata = {
  title: "À propos — AirplaneStore, la maison",
  description:
    "AirplaneStore : maquettes d'avion en résine monobloc, peintes à la main, pensées et éditées en France pour les passionnés d'aviation.",
  alternates: { canonical: "/a-propos" },
};

const PILLARS = [
  {
    eyebrow: "Sélection",
    title: "Une livrée, un récit.",
    body:
      "Nous ne référençons pas les maquettes au hasard — chaque modèle est choisi parce qu'il raconte quelque chose. L'A380 Air France, le Concorde, le 747 Air Force One : des avions qui ont marqué l'histoire civile ou marqué une époque.",
  },
  {
    eyebrow: "Fabrication",
    title: "Résine monobloc, peint main.",
    body:
      "Nos pièces sont coulées d'un seul tenant en résine haute densité, puis peintes à la main couche par couche. Pas de plastique injecté, pas de décals d'imprimante — la finition est conçue pour traverser les décennies.",
  },
  {
    eyebrow: "Éclairage",
    title: "LED activable au tap.",
    body:
      "Un système discret intégré dans le socle. Une tape sur le bois, et la cabine s'illumine. Batterie 75 mAh rechargeable en USB, auto-off après ~20 secondes pour préserver l'autonomie.",
  },
  {
    eyebrow: "Personnalisation",
    title: "Gravure laser au socle.",
    body:
      "Pour 15 € de plus, on grave votre nom, une date, une immatriculation, un numéro de vol. La maquette devient une pièce unique — idéal cadeau pilote, équipage ou départ à la retraite.",
  },
];

const TIMELINE = [
  { year: "2023", event: "Lancement d'AirplaneStore — Airbus A380 Air France comme premier modèle" },
  { year: "2024", event: "Élargissement à la collection Boeing — 747, 777, 787 Dreamliner" },
  { year: "2025", event: "Ajout du Concorde, des jets privés et des packs collection" },
  { year: "2026", event: "30+ maquettes au catalogue, expéditions vers toute l'Europe" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#06060f", minHeight: "100vh" }}>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "8rem",
          paddingBottom: "5rem",
          background:
            "linear-gradient(180deg, #050516 0%, #06060f 70%, #06060f 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(58,142,255,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div aria-hidden style={{ width: 28, height: 1, background: "rgba(58,142,255,0.6)" }} />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.28em",
                color: "rgba(120,180,255,0.85)",
              }}
            >
              ★ La maison AirplaneStore
            </span>
          </div>

          <h1
            className="font-black text-white mb-6"
            style={{
              fontSize: "clamp(2.2rem, 6vw, 4.6rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              background: "linear-gradient(180deg,#fff 0%,#cfd6e4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Des sculptures<br/>plutôt que des jouets.
          </h1>

          <p className="text-white/70 leading-relaxed max-w-2xl" style={{ fontSize: "1.05rem" }}>
            AirplaneStore est né d&apos;une obsession : éditer des répliques
            d&apos;avion à la hauteur des appareils qu&apos;elles représentent.
            Résine monobloc, peinture main, socle bois, LED intégré — chaque
            pièce est pensée pour s&apos;installer durablement sur le bureau
            d&apos;un commandant de bord, l&apos;étagère d&apos;un passionné ou
            la vitrine d&apos;un collectionneur.
          </p>
        </div>
      </section>

      {/* ── MANIFESTO ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 md:px-12 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6">
          <div aria-hidden style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }} />
          <span className="font-mono uppercase text-white/60" style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}>
            Notre histoire
          </span>
        </div>
        <div className="space-y-5 text-white/75 leading-relaxed" style={{ fontSize: "1rem" }}>
          <p>
            Nous avons commencé par une simple frustration : impossible de
            trouver une maquette de l&apos;A380 Air France qui rende justice à
            cet avion. Trop de plastique, trop d&apos;assemblage, trop peu de
            soin sur les finitions. Les modèles vraiment beaux étaient soit
            hors de prix (1 500 € et plus chez les éditeurs spécialisés),
            soit réservés aux flottes commerciales et inaccessibles au grand
            public.
          </p>
          <p>
            Nous avons donc lancé AirplaneStore avec une idée claire : produire
            des maquettes au niveau de finition des modèles haut de gamme, mais
            à un prix qui les rend offrables — typiquement entre 79 et 149 €.
            Résine monobloc plutôt qu&apos;assemblage, peinture à la main
            plutôt que décals industriels, socle bois plutôt que plastique,
            LED intégré plutôt qu&apos;option.
          </p>
          <p>
            Aujourd&apos;hui, le catalogue couvre l&apos;essentiel des grands
            modèles civils — Airbus A220 à A380, Boeing 737 à 787 Dreamliner,
            Concorde Air France et British Airways, jets privés Gulfstream —
            ainsi que des éditions plus rares comme le 747 Air Force One ou
            les livrées sponsor (Qatar PSG, Etihad × Manchester City).
          </p>
        </div>
      </section>

      {/* ── 4 PILLARS ─────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(58,142,255,0.025) 50%, transparent 100%)",
        }}
      >
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div aria-hidden style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <span className="font-mono uppercase text-white/60" style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}>
              Ce qui change tout
            </span>
          </div>

          <h2
            className="font-black text-white mb-12"
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Quatre choix qui font la différence.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {PILLARS.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 md:p-7"
                style={{
                  background: "linear-gradient(145deg,#0c0c1c 0%,#070710 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="font-mono uppercase mb-3"
                  style={{
                    fontSize: "0.58rem",
                    letterSpacing: "0.24em",
                    color: "rgba(120,180,255,0.85)",
                  }}
                >
                  0{i + 1} · {p.eyebrow}
                </p>
                <h3
                  className="font-bold text-white mb-2"
                  style={{
                    fontSize: "1.15rem",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.2,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-white/65 leading-relaxed"
                  style={{ fontSize: "0.92rem" }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 md:px-12 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6">
          <div aria-hidden style={{ width: 20, height: 1, background: "rgba(255,255,255,0.25)" }} />
          <span className="font-mono uppercase text-white/60" style={{ fontSize: "0.6rem", letterSpacing: "0.24em" }}>
            Chronologie
          </span>
        </div>
        <h2
          className="font-black text-white mb-10"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Trois ans d&apos;atelier.
        </h2>
        <ol className="relative space-y-5 md:space-y-6 pl-6 md:pl-8">
          <div
            aria-hidden
            className="absolute left-1.5 top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(to bottom, rgba(58,142,255,0.4) 0%, rgba(58,142,255,0.05) 100%)",
            }}
          />
          {TIMELINE.map((t, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.55rem] md:-left-[2.05rem] top-1.5 w-3 h-3 rounded-full"
                style={{
                  background: "#3a8eff",
                  boxShadow: "0 0 0 4px rgba(58,142,255,0.12)",
                }}
              />
              <div className="flex items-baseline gap-3 md:gap-4">
                <span
                  className="font-mono font-bold shrink-0"
                  style={{
                    color: "rgba(120,180,255,0.95)",
                    fontSize: "0.9rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  {t.year}
                </span>
                <span className="text-white/80" style={{ fontSize: "0.95rem" }}>
                  {t.event}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,180,77,0.04) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6 md:px-12 text-center">
          <p
            className="font-mono uppercase mb-4"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.28em",
              color: "rgba(255,180,77,0.95)",
            }}
          >
            ✈ Une question, un doute, une demande spéciale ?
          </p>
          <h2
            className="font-black text-white mb-6"
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            On vous répond sous 24 h.
          </h2>
          <p className="text-white/65 mb-8 mx-auto" style={{ maxWidth: 480 }}>
            Par email, WhatsApp ou via le formulaire de contact. Une livrée
            précise, une gravure, un délai serré pour un anniversaire — on
            trouve une solution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center font-semibold transition-transform hover:scale-[1.02]"
              style={{
                background: "#fff",
                color: "#06060f",
                padding: "0.95rem 1.6rem",
                borderRadius: 999,
                fontSize: "0.85rem",
              }}
            >
              Nous contacter →
            </Link>
            <Link
              href="/collections/all"
              className="inline-flex items-center font-semibold transition"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
                padding: "0.95rem 1.6rem",
                borderRadius: 999,
                fontSize: "0.85rem",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Voir la collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
