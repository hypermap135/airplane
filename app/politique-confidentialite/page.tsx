import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment AirplaneStore collecte, utilise et protège vos données personnelles conformément au RGPD.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/politique-confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-14 md:py-20">
        <nav className="text-xs text-ink-500 mb-6">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Accueil</Link>
          {" / "}
          <span className="text-ink-900">Politique de confidentialité</span>
        </nav>

        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
          RGPD
        </div>
        <h1 className="h-display text-3xl md:text-4xl mb-6">Politique de confidentialité</h1>
        <p className="text-sm text-ink-500 mb-10">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
        </p>

        <section className="prose prose-sm md:prose-base max-w-none text-ink-700 space-y-8">
          <Block title="Qui traite vos données ?">
            <p>
              Le responsable du traitement est <strong>AirplaneStore</strong> (voir{" "}
              <Link href="/mentions-legales" className="text-brand underline">mentions légales</Link>
              ). Contact :{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>
              .
            </p>
          </Block>

          <Block title="Quelles données collectons-nous ?">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Compte / commande :</strong> nom, prénom, email, téléphone, adresses de livraison et de
                facturation, historique des commandes.
              </li>
              <li>
                <strong>Paiement :</strong> le paiement est délégué à Shopify Payments / Stripe / PayPal. Nous
                ne conservons aucun numéro de carte bancaire.
              </li>
              <li>
                <strong>Formulaire de contact :</strong> email + contenu du message.
              </li>
              <li>
                <strong>Navigation :</strong> pages visitées, source de la visite (UTM), informations techniques
                (navigateur, appareil, IP anonymisée) — via cookies et outils de mesure.
              </li>
            </ul>
          </Block>

          <Block title="Pourquoi ?">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Traiter vos commandes</strong> (base légale : exécution du contrat).</li>
              <li><strong>Vous répondre</strong> quand vous nous contactez (intérêt légitime).</li>
              <li><strong>Améliorer le site</strong> et mesurer son audience (intérêt légitime / consentement).</li>
              <li><strong>Respecter nos obligations légales</strong> (conservation comptable, fiscale).</li>
              <li><strong>Vous envoyer des offres</strong>, uniquement si vous y avez consenti explicitement.</li>
            </ul>
          </Block>

          <Block title="Combien de temps ?">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Commandes :</strong> 10 ans (obligation comptable).</li>
              <li><strong>Prospects :</strong> 3 ans après le dernier contact.</li>
              <li><strong>Messages de contact :</strong> 2 ans.</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum.</li>
            </ul>
          </Block>

          <Block title="À qui vos données sont transmises ?">
            <p>
              Uniquement à nos sous-traitants techniques, encadrés par contrat conforme au RGPD :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Shopify Inc.</strong> — plateforme e-commerce et paiement (Canada / UE)</li>
              <li><strong>Vercel Inc.</strong> — hébergement du site (USA)</li>
              <li><strong>Transporteurs</strong> (La Poste, Colissimo, Chronopost…) — pour la livraison</li>
              <li><strong>Meta / Google</strong> — mesure d'audience et publicité, uniquement si vous acceptez les cookies</li>
            </ul>
            <p>
              Aucune donnée n'est vendue à des tiers.
            </p>
          </Block>

          <Block title="Vos droits">
            <p>Conformément au RGPD, vous pouvez à tout moment :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Accéder</strong> à vos données</li>
              <li><strong>Rectifier</strong> une information inexacte</li>
              <li><strong>Effacer</strong> vos données (« droit à l'oubli »)</li>
              <li><strong>Vous opposer</strong> à leur traitement</li>
              <li><strong>Restreindre</strong> le traitement</li>
              <li><strong>Récupérer</strong> vos données dans un format portable</li>
              <li><strong>Retirer votre consentement</strong> à tout moment (newsletter, cookies non essentiels)</li>
            </ul>
            <p>
              Pour exercer un droit, écrivez à{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>
              . Nous répondons sous 30 jours maximum.
            </p>
            <p>
              Vous pouvez aussi introduire une réclamation auprès de la <strong>CNIL</strong> —{" "}
              <a href="https://www.cnil.fr/plaintes" target="_blank" rel="noopener" className="text-brand underline">
                cnil.fr/plaintes
              </a>
              .
            </p>
          </Block>

          <Block title="Sécurité">
            <p>
              Le site est chiffré en HTTPS (SSL). Vos données sont stockées sur des serveurs sécurisés soumis
              aux standards de l'industrie. Les mots de passe (si applicable) sont hachés — nous ne pouvons pas
              les lire.
            </p>
          </Block>

          <Block title="Transferts hors UE">
            <p>
              Certains de nos sous-traitants (Vercel, Google, Meta) sont établis aux États-Unis. Les transferts
              de données sont encadrés par des clauses contractuelles types (CCT) approuvées par la Commission
              européenne, garantissant un niveau de protection équivalent au RGPD.
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
