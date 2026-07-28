import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site airplanestore.fr — éditeur, hébergement, propriété intellectuelle, contact.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-14 md:py-20">
        <nav className="text-xs text-ink-500 mb-6">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Accueil</Link>
          {" / "}
          <span className="text-ink-900">Mentions légales</span>
        </nav>

        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
          Informations légales
        </div>
        <h1 className="h-display text-3xl md:text-4xl mb-6">Mentions légales</h1>
        <p className="text-sm text-ink-500 mb-10">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
        </p>

        <section className="prose prose-sm md:prose-base max-w-none text-ink-700 space-y-8">
          <Block title="Éditeur du site">
            <p>
              <strong>Raison sociale :</strong> AirplaneStore<br />
              <strong>Forme juridique :</strong> Entreprise individuelle<br />
              <strong>Siège :</strong> France<br />
              <strong>Email :</strong>{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>
              <br />
              <strong>Directeur de la publication :</strong> le représentant légal de l'entreprise.
            </p>
            <p className="text-xs text-ink-500">
              Coordonnées complètes (SIRET, adresse postale, numéro TVA) disponibles sur simple demande à l'adresse email ci-dessus, conformément à la LCEN (Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique).
            </p>
          </Block>

          <Block title="Hébergement">
            <p>
              Le site airplanestore.fr est hébergé par :<br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
              Site : <a href="https://vercel.com" target="_blank" rel="noopener" className="text-brand underline">vercel.com</a>
            </p>
          </Block>

          <Block title="Propriété intellectuelle">
            <p>
              L'ensemble du contenu du site (textes, photographies, illustrations, logos, éléments d'interface,
              code source) est protégé par le droit d'auteur et le droit des marques. Toute reproduction,
              représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable
              d'AirplaneStore, est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété
              intellectuelle.
            </p>
            <p>
              Les livrées, logos et marques de compagnies aériennes ou d'entreprises tierces reproduits sur les
              maquettes restent la propriété exclusive de leurs détenteurs respectifs. Ils sont utilisés à des
              fins de représentation fidèle du modèle réel, sans lien commercial ni approbation implicite.
            </p>
          </Block>

          <Block title="Données personnelles">
            <p>
              Le traitement de vos données personnelles est décrit dans notre{" "}
              <Link href="/politique-confidentialite" className="text-brand underline">
                politique de confidentialité
              </Link>
              . Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité conformément
              au RGPD. Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>
              .
            </p>
          </Block>

          <Block title="Cookies">
            <p>
              Le site utilise des cookies techniques nécessaires au fonctionnement (panier, session, préférences)
              et, si activés, des cookies de mesure d'audience et de suivi marketing. Détails et gestion sur la
              page{" "}
              <Link href="/cookies" className="text-brand underline">
                Cookies
              </Link>
              .
            </p>
          </Block>

          <Block title="Conditions de vente">
            <p>
              L'ensemble des conditions applicables aux commandes passées sur airplanestore.fr est décrit dans
              nos{" "}
              <Link href="/cgv" className="text-brand underline">
                Conditions Générales de Vente
              </Link>
              .
            </p>
          </Block>

          <Block title="Médiation de la consommation">
            <p>
              Conformément à l'article L. 612-1 du Code de la consommation, en cas de litige avec un consommateur,
              celui-ci peut recourir gratuitement à un médiateur de la consommation. Les coordonnées du médiateur
              seront transmises sur demande à{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>
              . Le consommateur peut également utiliser la plateforme européenne de règlement en ligne des litiges :{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener" className="text-brand underline">
                ec.europa.eu/consumers/odr
              </a>
              .
            </p>
          </Block>

          <Block title="Loi applicable">
            <p>
              Les présentes mentions légales et l'utilisation du site sont régies par le droit français. Tout
              litige relatif à leur interprétation ou à leur exécution relève de la compétence exclusive des
              tribunaux français.
            </p>
          </Block>
        </section>
      </div>
    </div>
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
