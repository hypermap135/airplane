import Link from "next/link";
import Image from "next/image";

/**
 * B2B hero — client's stated pivot. Personalisation d'entreprise à partir
 * de 30 exemplaires en avant, catalogue standard en secondaire.
 *
 * Design : airmodels-inspired, blanc / gris / bleu, zéro animation.
 * Layout : deux colonnes desktop, empilé mobile.
 */
export default function HeroB2B() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-10 md:pt-16 pb-14 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
          {/* ─── Left : copy ─── */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
              <span aria-hidden>★</span>
              Personnalisation entreprise
            </span>

            <h1
              className="mt-5 h-display"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
            >
              Vos maquettes d'avion
              <br />
              <span className="text-brand">personnalisées</span> à partir de
              <br />
              <span className="text-brand">30 exemplaires.</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-ink-500 max-w-xl leading-relaxed">
              Livrée sur-mesure, gravure de vos noms & logos, écrin avec plaque
              gravée. Idéal pour un cadeau client, un remerciement partenaires,
              ou un événement d'entreprise mémorable.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary" style={{ textDecoration: "none" }}>
                Demander un devis →
              </Link>
              <Link href="#bestsellers" className="btn-secondary" style={{ textDecoration: "none" }}>
                Voir la boutique
              </Link>
            </div>

            {/* Micro trust row */}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-500">
              <span className="flex items-center gap-2"><span className="text-brand" aria-hidden>✓</span> Fait en France</span>
              <span className="flex items-center gap-2"><span className="text-brand" aria-hidden>✓</span> Livraison 4–6 semaines</span>
              <span className="flex items-center gap-2"><span className="text-brand" aria-hidden>✓</span> Écrin & plaque incluse</span>
            </div>
          </div>

          {/* ─── Right : hero image ─── */}
          <div
            className="relative overflow-hidden rounded-lg"
            style={{ background: "var(--tile-gray)", aspectRatio: "5 / 4" }}
          >
            <Image
              src="/images/a380-emirates.png"
              alt="Maquette Airbus A380 Emirates personnalisée avec plaque gravée"
              fill
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              style={{ objectFit: "contain", padding: "6% 8%" }}
            />
            {/* Small floating badge, airmodels-style */}
            <span className="badge-featured absolute top-4 left-4">
              <span aria-hidden>★</span> Featured
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
