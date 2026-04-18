import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "Conditions Générales de Vente",
};

export default function CGVPage() {
  return (
    <section className="pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading eyebrow="Juridique" title="Conditions Générales de Vente" />
        <div className="mt-10 space-y-8 text-mute leading-relaxed text-sm">
          <Block title="1. Champ d'application">
            Les présentes conditions régissent les ventes réalisées sur shop.airplanestore.fr,
            opérées par AirplaneStore. Toute commande implique l'acceptation pleine et entière des
            présentes conditions.
          </Block>
          <Block title="2. Produits">
            Les produits proposés sont décrits et présentés avec la plus grande exactitude possible.
            Les photographies peuvent présenter un watermark temporaire — le produit livré est
            conforme à la description (résine monobloc, socle bois, LED intégré).
          </Block>
          <Block title="3. Prix">
            Les prix sont indiqués en euros toutes taxes comprises. Ils peuvent évoluer à tout
            moment ; les produits sont facturés sur la base des tarifs en vigueur au moment de la
            validation de la commande.
          </Block>
          <Block title="4. Commande et paiement">
            Le paiement est sécurisé et opéré via Shopify. Le checkout invité est activé — la
            création d'un compte n'est pas obligatoire.
          </Block>
          <Block title="5. Livraison">
            Livraison en France, Belgique, Suisse et dans toute l'Europe. Délai indicatif : 7 à 15
            jours ouvrés. Livraison offerte dès 100€ d'achat.
          </Block>
          <Block title="6. Droit de rétractation">
            Vous disposez de 30 jours à compter de la réception pour retourner le produit. Retour
            offert depuis la France. Le produit doit être retourné dans sa boîte d'origine, en
            parfait état.
          </Block>
          <Block title="7. Service client">
            Email : contact@airplanestore.fr. Réponse sous 24 h ouvrées.
          </Block>
        </div>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="display text-white text-base mb-3">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
