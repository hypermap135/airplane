import Link from "next/link";
import Image from "next/image";

/**
 * B2B hero — épuré. Une seule promesse, un CTA principal.
 * Airmodels-inspired : blanc / gris / bleu, zéro animation, texte tight.
 */
export default function HeroB2B() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-8 md:pt-14 pb-12 md:pb-20">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.05fr_1fr] items-center">
          {/* ─── Left : copy ─── */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
              <span aria-hidden>★</span> Spécialiste maquettes personnalisées
            </span>

            <h1
              className="mt-5 h-display"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
            >
              Spécialisé dans les
              <br />
              <span className="text-brand">maquettes d&apos;avion</span>
              <br />
              <span className="text-brand">personnalisées.</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-ink-500 max-w-lg leading-relaxed">
              Vos couleurs, vos noms, votre logo — gravés à la main sur bois.
              Cadeau client, séminaire, remerciement. <strong className="text-ink-900">Devis en 24 h.</strong>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-black uppercase text-sm tracking-widest text-white transition-transform hover:scale-[1.02]"
                style={{
                  padding: "1.05rem 1.75rem",
                  borderRadius: 999,
                  background: "var(--ink-900)",
                  textDecoration: "none",
                }}
              >
                Demander un devis →
              </Link>
              <Link
                href="#bestsellers"
                className="inline-flex items-center gap-2 font-semibold text-sm text-ink-700 hover:text-brand transition-colors"
                style={{ padding: "1.05rem 0.5rem", textDecoration: "none" }}
              >
                Ou voir la boutique →
              </Link>
            </div>

            {/* Trust row — plus compact */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><span className="text-brand">✓</span> Entreprise française</span>
              <span className="flex items-center gap-1.5"><span className="text-brand">✓</span> Devis en 24 h</span>
              <span className="flex items-center gap-1.5"><span className="text-brand">✓</span> Écrin + plaque incluse</span>
            </div>
          </div>

          {/* ─── Right : hero image ─── */}
          <div
            className="relative overflow-hidden rounded-lg"
            style={{ background: "var(--tile-gray)", aspectRatio: "5 / 4" }}
          >
            <Image
              src="/images/hero/hero-benfica.webp"
              alt="Maquette A320 personnalisée SL Benfica Lisbon — livrée sur-mesure gravée main"
              fill
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              style={{ objectFit: "cover" }}
            />
            <span className="badge-featured absolute top-4 left-4">
              <span aria-hidden>★</span> Signature
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
