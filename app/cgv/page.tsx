export const metadata = {
  title: "Conditions Générales de Vente",
};

export default function CGVPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-brand-light border-b border-ink-line">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-10 md:py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-2">
            Juridique
          </div>
          <h1 className="h-display text-3xl md:text-4xl">Conditions Générales de Vente</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-8 py-10 md:py-14 space-y-8 text-ink-700 leading-relaxed text-sm">
        <Block title="1. Champ d'application">
          Les présentes conditions régissent les ventes réalisées sur airplanestore.fr,
          opérées par AirplaneStore. Toute commande implique l&apos;acceptation pleine et entière
          des présentes conditions.
        </Block>
        <Block title="2. Produits">
          Les produits proposés sont décrits et présentés avec la plus grande exactitude possible.
          Le produit livré est conforme à la description (résine monobloc, socle bois, LED intégré).
        </Block>
        <Block title="3. Prix">
          Les prix sont indiqués en euros toutes taxes comprises. Ils peuvent évoluer à tout
          moment ; les produits sont facturés sur la base des tarifs en vigueur au moment de la
          validation de la commande.
        </Block>
        <Block title="4. Commande et paiement">
          Le paiement est sécurisé et opéré via Shopify. Le checkout invité est activé — la
          création d&apos;un compte n&apos;est pas obligatoire.
        </Block>
        <Block title="5. Livraison">
          Livraison en France, Belgique, Suisse et dans toute l&apos;Europe. Délai indicatif :
          7 à 15 jours ouvrés. Livraison offerte dès 100€ d&apos;achat.
        </Block>
        <Block title="6. Droit de rétractation">
          Vous disposez de 30 jours à compter de la réception pour retourner le produit. Retour
          offert depuis la France. Le produit doit être retourné dans sa boîte d&apos;origine, en
          parfait état.
        </Block>
        <Block title="7. Service client">
          Email : contact@airplanestore.fr. Réponse sous 24 h ouvrées.
        </Block>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-ink-900 font-bold text-base mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
