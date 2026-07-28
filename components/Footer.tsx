"use client";

import Link from "next/link";

const NAV = [
  {
    title: "Collections",
    links: [
      { href: "/collections/airbus",   label: "Airbus" },
      { href: "/collections/boeing",   label: "Boeing" },
      { href: "/collections/concorde", label: "Concorde" },
      { href: "/collections/jet",      label: "Jet privé" },
      { href: "/collections/packs",    label: "Packs" },
      { href: "/collections/all",      label: "Tout voir" },
    ],
  },
  {
    title: "Boutique",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact",  label: "Contact" },
      { href: "/faq",      label: "FAQ" },
      { href: "/livraison-retours", label: "Livraison & retours" },
    ],
  },
  {
    title: "Informations",
    links: [
      { href: "/cgv",                        label: "CGV" },
      { href: "/mentions-legales",           label: "Mentions légales" },
      { href: "/politique-confidentialite",  label: "Confidentialité" },
      { href: "/cookies",                    label: "Cookies" },
    ],
  },
];

const GUARANTEES = [
  "Livraison 7–15 jours",
  "Livraison offerte dès 100€",
  "Retour 30 jours",
  "Paiement sécurisé SSL",
];

export default function Footer() {
  return (
    <footer className="bg-[#f6f7fa] border-t border-ink-line text-ink-700">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-14 pb-8">
        {/* Guarantees strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 pb-10 border-b border-ink-line">
          {GUARANTEES.map((g) => (
            <div key={g} className="flex items-center gap-2 text-sm text-ink-700">
              <span className="text-brand" aria-hidden>✓</span>
              {g}
            </div>
          ))}
        </div>

        {/* Nav columns */}
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" aria-label="AirplaneStore" className="inline-flex items-center text-ink-900" style={{ textDecoration: "none" }}>
              <svg viewBox="0 0 320 80" width="180" height="36" fill="currentColor" aria-hidden style={{ display: "block" }}>
                <path d="M4 34 Q 20 32 34 32" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <path d="M12 40 L 46 40 L 60 30 L 66 30 L 58 40 L 74 40 L 72 42 L 58 42 L 66 52 L 60 52 L 46 42 L 12 42 Z"/>
                <text x="86" y="48" fontFamily="Inter, system-ui, sans-serif" fontWeight={800} fontSize={22} letterSpacing={1.5} fill="currentColor">
                  AIRPLANESTORE
                </text>
              </svg>
            </Link>
            <p className="mt-4 text-sm text-ink-500 max-w-md">
              Maquettes d'avion premium et forfaits entreprise personnalisés
              sur devis. Entreprise française.
            </p>
          </div>

          {NAV.map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-ink-900 text-sm mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-700 hover:text-brand transition-colors"
                      style={{ textDecoration: "none" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-ink-line flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink-500">
          <div>© {new Date().getFullYear()} AirplaneStore. Tous droits réservés.</div>
          <div className="flex items-center gap-4">
            <Link href="/cgv" className="hover:text-brand" style={{ textDecoration: "none" }}>CGV</Link>
            <Link href="/mentions-legales" className="hover:text-brand" style={{ textDecoration: "none" }}>Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
