import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description:
    "Délais, tarifs, retour gratuit 30 jours — tout sur la livraison de vos maquettes d'avion AirplaneStore.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/livraison-retours" },
};

export default function LivraisonRetoursPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-14 md:py-20">
        <nav className="text-xs text-ink-500 mb-6">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Accueil</Link>
          {" / "}
          <span className="text-ink-900">Livraison & retours</span>
        </nav>

        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
          Politique
        </div>
        <h1 className="h-display text-3xl md:text-4xl mb-6">Livraison & retours</h1>
        <p className="text-sm text-ink-500 mb-10">
          Tout ce qu'il faut savoir pour recevoir votre maquette et la retourner si besoin.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <Stat icon="🚚" label="Livraison" value="7 à 15 jours" />
          <Stat icon="💰" label="Offerte dès" value="100 €" />
          <Stat icon="↩" label="Retour" value="30 jours" />
          <Stat icon="🇫🇷" label="Zone" value="France & UE" />
        </div>

        <section className="prose prose-sm md:prose-base max-w-none text-ink-700 space-y-8">
          <Block title="Zones de livraison">
            <p>Nous livrons en :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>France métropolitaine et Corse</li>
              <li>Belgique, Luxembourg, Suisse</li>
              <li>Union européenne (Allemagne, Italie, Espagne, Pays-Bas, Autriche…)</li>
              <li>Autres pays sur demande —{" "}
                <Link href="/contact" className="text-brand underline">nous contacter</Link>{" "}
                pour un devis
              </li>
            </ul>
          </Block>

          <Block title="Délais">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>France métropolitaine :</strong> 7 à 15 jours ouvrés à compter de la validation du
                paiement.
              </li>
              <li>
                <strong>Corse, DROM-COM, Europe :</strong> 10 à 20 jours ouvrés.
              </li>
              <li>
                <strong>Maquettes personnalisées / forfait entreprise :</strong> 3 à 6 semaines selon
                complexité (livrée sur-mesure, gravure logo, série numérotée).
              </li>
              <li>
                <strong>Gravure personnalisée</strong> sur une maquette standard :{" "}
                <strong>+2 à 3 jours ouvrés</strong> par rapport au délai normal.
              </li>
            </ul>
            <p className="text-sm text-ink-500">
              Le suivi de livraison est envoyé par email dès l'expédition (numéro de suivi transporteur).
            </p>
          </Block>

          <Block title="Tarifs de livraison">
            <div className="border border-ink-line rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#fafbfc]">
                  <tr>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Destination</th>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Tarif</th>
                    <th className="text-left px-4 py-2 border-b border-ink-line">Gratuit à partir de</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-ink-line">
                    <td className="px-4 py-2">France métropolitaine</td>
                    <td className="px-4 py-2">9,90 €</td>
                    <td className="px-4 py-2 text-brand font-semibold">100 €</td>
                  </tr>
                  <tr className="border-t border-ink-line">
                    <td className="px-4 py-2">Corse, DROM-COM</td>
                    <td className="px-4 py-2">14,90 €</td>
                    <td className="px-4 py-2 text-ink-500">—</td>
                  </tr>
                  <tr className="border-t border-ink-line">
                    <td className="px-4 py-2">Union européenne</td>
                    <td className="px-4 py-2">19,90 €</td>
                    <td className="px-4 py-2 text-brand font-semibold">150 €</td>
                  </tr>
                  <tr className="border-t border-ink-line">
                    <td className="px-4 py-2">Suisse</td>
                    <td className="px-4 py-2">29,90 €</td>
                    <td className="px-4 py-2 text-ink-500">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-500">
              Les frais de douane éventuels (Suisse, hors UE) sont à la charge du destinataire.
            </p>
          </Block>

          <Block title="Emballage">
            <p>
              Chaque maquette est livrée <strong>dans sa boîte d'origine</strong>, calée pour résister au
              transport. Les maquettes de grande taille (A380, 747, 777) peuvent nécessiter un renfort
              supplémentaire selon le transporteur.
            </p>
          </Block>

          <Block title="Retour gratuit 30 jours">
            <p>
              Vous avez <strong>30 jours à compter de la réception</strong> pour changer d'avis, sans avoir
              à vous justifier (article L. 221-18 du Code de la consommation).
            </p>
            <p><strong>Comment faire un retour :</strong></p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Envoyez un email à{" "}
                <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                  contact@airplanestore.fr
                </a>{" "}
                avec votre numéro de commande et le motif du retour.
              </li>
              <li>
                Nous vous envoyons sous 24-48h une <strong>étiquette de retour prépayée</strong> (retour
                gratuit en France métropolitaine).
              </li>
              <li>
                Emballez la maquette dans sa boîte d'origine, avec tous les accessoires (socle, notice, câble
                USB…).
              </li>
              <li>
                Déposez le colis en point relais ou bureau de poste.
              </li>
              <li>
                Dès réception et vérification, nous vous <strong>remboursons intégralement sous 14 jours</strong>{" "}
                (produit + frais de livraison initiaux) sur le moyen de paiement utilisé.
              </li>
            </ol>
            <p className="text-xs text-ink-500">
              Le produit doit être en état neuf, non utilisé, dans son emballage d'origine. Les gravures
              personnalisées ne sont pas remboursables (article L. 221-28 du Code de la consommation :
              biens confectionnés selon spécifications du consommateur).
            </p>
          </Block>

          <Block title="Casse ou colis endommagé">
            <p>
              À la réception, <strong>ouvrez le colis en présence du livreur</strong> si l'emballage extérieur
              est endommagé. Émettez des réserves écrites sur le bon de livraison et prenez des photos.
            </p>
            <p>
              Envoyez-nous ces photos + votre numéro de commande à{" "}
              <a href="mailto:contact@airplanestore.fr" className="text-brand underline">
                contact@airplanestore.fr
              </a>{" "}
              dans les 48h. Nous vous renvoyons une nouvelle maquette gratuitement.
            </p>
          </Block>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="text-center p-4 rounded border border-ink-line bg-[#fafbfc]">
      <div className="text-2xl mb-1" aria-hidden>{icon}</div>
      <div className="text-xs uppercase tracking-widest text-ink-500">{label}</div>
      <div className="text-sm font-bold text-ink-900 mt-0.5">{value}</div>
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
