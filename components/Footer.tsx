import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-ink-border bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="display text-white text-base">AIRPLANESTORE</div>
          <p className="mt-3 text-sm text-mute leading-relaxed">
            Maquettes d'avion en résine monobloc. Répliques fidèles. Échelle 1/147. LED intégré.
          </p>
        </div>

        <div>
          <div className="hud text-white/70">Collections</div>
          <ul className="mt-4 space-y-2 text-sm text-mute">
            <li><Link href="/collections/airbus" className="hover:text-white">Airbus</Link></li>
            <li><Link href="/collections/boeing" className="hover:text-white">Boeing</Link></li>
            <li><Link href="/collections/concorde" className="hover:text-white">Concorde</Link></li>
            <li><Link href="/collections/packs" className="hover:text-white">Packs</Link></li>
            <li><Link href="/collections/accessoires" className="hover:text-white">Accessoires</Link></li>
          </ul>
        </div>

        <div>
          <div className="hud text-white/70">Boutique</div>
          <ul className="mt-4 space-y-2 text-sm text-mute">
            <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/cgv" className="hover:text-white">CGV</Link></li>
          </ul>
        </div>

        <div>
          <div className="hud text-white/70">Livraison & garanties</div>
          <ul className="mt-4 space-y-2 text-sm text-mute">
            <li>Livraison France & Europe 7–15 jours</li>
            <li>Livraison offerte dès 100€</li>
            <li>Satisfait ou remboursé 30 jours</li>
            <li>Paiement sécurisé Shopify</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-border/80">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-mute">
          <div>© {new Date().getFullYear()} AirplaneStore — Tous droits réservés.</div>
          <div className="hud">EST. PARIS · FRANCE & EUROPE</div>
        </div>
      </div>
    </footer>
  );
}
