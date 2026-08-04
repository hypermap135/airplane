import Link from "next/link";
import Image from "next/image";
import type { CorporateContent } from "@/lib/site-content";

/**
 * "Nos réalisations entreprises" — social proof pour la section B2B.
 * Contenu 100% éditable via /admin/contenu (tab Corporate).
 */
export default function CorporateShowcase({ content }: { content: CorporateContent }) {
  return (
    <section className="relative overflow-hidden bg-[#f6f7fa] border-y border-ink-line section">
      <div
        aria-hidden
        className="absolute pointer-events-none select-none"
        style={{
          top: "50%",
          right: "-8%",
          transform: "translateY(-50%) rotate(-8deg)",
          width: "60%",
          height: "80%",
          backgroundImage: "url('/images/maquette-avion-maquette-airbus-a380.webp')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          opacity: 0.06,
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        {/* Section head */}
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            {content.sectionTag}
          </div>
          <h2 className="h-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)" }}>
            {content.sectionTitle}
          </h2>
          <p className="mt-3 text-ink-500">{content.sectionSubtitle}</p>
        </div>

        {/* Logos strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 pb-10 md:pb-14 border-b border-ink-line">
          {content.logos.map((l) => (
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
          {content.cases.map((c, i) => (
            <article
              key={`${c.title}-${i}`}
              className="bg-white border border-ink-line rounded-md overflow-hidden flex flex-col"
            >
              <div
                className="relative w-full overflow-hidden"
                style={{ background: "#0a0a14", aspectRatio: "4 / 3" }}
              >
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    style={{ objectFit: "cover" }}
                  />
                )}
                <span
                  className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
                  style={{ background: c.accent, color: "#fff" }}
                >
                  {c.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-ink-900 font-bold text-lg mb-2">
                  {c.title}
                </h3>
                <p className="text-ink-500 text-sm leading-relaxed">{c.body}</p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-black uppercase text-sm tracking-widest text-ink-900 transition-transform hover:scale-[1.02]"
            style={{
              padding: "1rem 1.75rem",
              borderRadius: 999,
              background: "linear-gradient(135deg, #ffdc73 0%, #f0c040 60%, #d9a52d 100%)",
              border: "1px solid #d9a52d",
              boxShadow: "0 8px 24px rgba(240,192,64,0.35)",
              textDecoration: "none",
            }}
          >
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
