import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique cookies",
  description:
    "Quels cookies utilise AirplaneStore, pourquoi, et comment les gérer.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-14 md:py-20">
        <nav className="text-xs text-ink-500 mb-6">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Accueil</Link>
          {" / "}
          <span className="text-ink-900">Politique cookies</span>
        </nav>

        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
          Cookies
        </div>
        <h1 className="h-display text-3xl md:text-4xl mb-6">Politique cookies</h1>
        <p className="text-sm text-ink-500 mb-10">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
        </p>

        <section className="prose prose-sm md:prose-base max-w-none text-ink-700 space-y-8">
          <Block title="Qu'est-ce qu'un cookie ?">
            <p>
              Un cookie est un petit fichier texte déposé sur votre navigateur lorsque vous visitez un site. Il
              permet au site de vous reconnaître d'une page à l'autre, de mémoriser vos préférences (panier,
              langue) et — s'il s'agit de cookies de mesure ou de publicité — de compter les visites ou de
              vous montrer des annonces pertinentes.
            </p>
          </Block>

          <Block title="Quels cookies utilisons-nous ?">
            <div className="border border-ink-line rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#fafbfc] text-ink-900">
                  <tr>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Cookie</th>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Finalité</th>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Durée</th>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Consentement</th>
                  </tr>
                </thead>
                <tbody className="text-ink-700">
                  <Row cookie="airplanestore.cart.v1" purpose="Mémoriser le panier" duration="Persistant" consent="Non requis (technique)" />
                  <Row cookie="airplanestore.wishlist.v1" purpose="Mémoriser les favoris" duration="Persistant" consent="Non requis (technique)" />
                  <Row cookie="admin-session" purpose="Session admin (dashboard interne)" duration="7 jours" consent="Non requis (technique)" />
                  <Row cookie="utm_source, utm_medium, utm_campaign…" purpose="Attribution de la source de visite (Meta / Google Ads)" duration="30 jours" consent="Requis" />
                  <Row cookie="_fbp, _fbc (Meta Pixel)" purpose="Mesure des conversions Facebook / Instagram Ads" duration="90 jours" consent="Requis" />
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-500 mt-2">
              Les cookies « techniques » sont indispensables au fonctionnement du site (panier, favoris,
              session admin). Ils ne nécessitent pas votre consentement selon la CNIL. Les autres ne sont
              déposés qu'après votre accord.
            </p>
          </Block>

          <Block title="Comment gérer vos cookies ?">
            <p>
              À tout moment, vous pouvez modifier votre choix directement dans votre navigateur :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies et autres données des sites.
              </li>
              <li>
                <strong>Safari :</strong> Réglages → Confidentialité → Gérer les données des sites Web.
              </li>
              <li>
                <strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies et données des sites.
              </li>
              <li>
                <strong>Edge :</strong> Paramètres → Cookies et autorisations de site.
              </li>
            </ul>
            <p>
              Bloquer les cookies techniques (panier, favoris) peut casser certaines fonctionnalités du site.
            </p>
          </Block>

          <Block title="Cookies tiers">
            <p>
              Les cookies de mesure et publicité sont déposés par des services tiers dont voici les politiques :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Meta (Facebook / Instagram) :</strong>{" "}
                <a href="https://www.facebook.com/policy/cookies/" target="_blank" rel="noopener" className="text-brand underline">
                  facebook.com/policy/cookies
                </a>
              </li>
              <li>
                <strong>Shopify :</strong>{" "}
                <a href="https://www.shopify.com/legal/cookies" target="_blank" rel="noopener" className="text-brand underline">
                  shopify.com/legal/cookies
                </a>
              </li>
            </ul>
          </Block>

          <Block title="Contact">
            <p>
              Pour toute question sur les cookies :{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>
              .
            </p>
          </Block>
        </section>
      </div>
    </div>
  );
}

function Row({ cookie, purpose, duration, consent }: { cookie: string; purpose: string; duration: string; consent: string }) {
  return (
    <tr className="border-t border-ink-line">
      <td className="px-4 py-2 font-mono text-xs">{cookie}</td>
      <td className="px-4 py-2">{purpose}</td>
      <td className="px-4 py-2">{duration}</td>
      <td className="px-4 py-2">{consent}</td>
    </tr>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="h-display text-lg md:text-xl mb-3 text-ink-900">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
