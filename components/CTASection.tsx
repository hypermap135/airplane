import Link from "next/link";
import FAQ from "./FAQ";
import SectionHeading from "./SectionHeading";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid gap-14 lg:grid-cols-2 items-start">
        <div>
          <SectionHeading
            eyebrow="Passez aux commandes"
            title="Votre prochaine pièce de collection"
            subtitle="Livraison France & Europe. Emballage premium. Satisfait ou remboursé 30 jours."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/collections/all" className="btn-chrome">
              Voir la collection →
            </Link>
            <Link href="/collections/packs" className="btn-ghost">
              Découvrir les packs
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            <Stat label="Livraison" value="7–15 j" />
            <Stat label="Retour" value="30 jours" />
            <Stat label="Note" value="4.9/5" />
          </div>
        </div>

        <div className="lg:pt-16">
          <FAQ />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-600/50 px-4 py-3">
      <div className="hud text-white/50">{label}</div>
      <div className="mt-1 font-mono text-white text-sm">{value}</div>
    </div>
  );
}
