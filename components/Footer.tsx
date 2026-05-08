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
      { href: "/collections/packs",    label: "Packs & offres" },
      { href: "/collections/all",      label: "Tout voir" },
    ],
  },
  {
    title: "Boutique",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact",  label: "Contact" },
      { href: "/faq",      label: "FAQ" },
      { href: "/cgv",      label: "CGV" },
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
    <footer className="relative overflow-hidden" style={{ background: "#010108" }}>
      {/* Top accent line */}
      <div style={{
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(58,142,255,0.4) 30%, rgba(255,255,255,0.12) 50%, rgba(58,142,255,0.4) 70%, transparent)",
      }} />

      {/* Ambient glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 20% 80%, rgba(18,50,160,0.07) 0%, transparent 65%)",
      }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 pt-16 md:pt-20 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-12 md:gap-8 pb-14">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="foot-chrome" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="55%" stopColor="#cfd6e2" />
                    <stop offset="100%" stopColor="#3a8eff" />
                  </linearGradient>
                </defs>
                <path d="M16 3 L17.4 4.6 L17.4 11 L29 16 L29 17.6 L17.4 14.6 L17.4 22.6 L21.6 25.2 L21.6 26.8 L16 25.4 L10.4 26.8 L10.4 25.2 L14.6 22.6 L14.6 14.6 L3 17.6 L3 16 L14.6 11 L14.6 4.6 Z"
                  fill="url(#foot-chrome)" opacity="0.92" />
                <ellipse cx="16" cy="6.5" rx="0.9" ry="1.3" fill="rgba(58,142,255,0.5)" />
              </svg>
              <span className="font-black text-[0.85rem] tracking-[0.18em] uppercase text-white">
                AIRPLANESTORE
              </span>
            </Link>

            <p className="text-[0.84rem] leading-[1.75]" style={{ color: "#565870", maxWidth: 240 }}>
              Maquettes d'avion en résine monobloc. Peinture main. LED intégré. Chaque pièce est une sculpture de collection.
            </p>

            {/* Trust chips */}
            <div className="mt-6 flex flex-col gap-2">
              {[
                { icon: "★", text: "4.8 / 5 · 1 847 clients" },
                { icon: "✦", text: "Livraison France & Europe" },
                { icon: "◈", text: "Satisfait ou remboursé 30 j" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5">
                  <span className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.5)" }}>
                    {item.icon}
                  </span>
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase" style={{ color: "#565870" }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-5"
                style={{ color: "rgba(58,142,255,0.5)" }}>
                {col.title}
              </div>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.82rem] transition-colors duration-200"
                      style={{ color: "#565870" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#3a4055")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Guarantees — non-linked */}
          <div>
            <div className="font-mono text-[0.58rem] tracking-[0.28em] uppercase mb-5"
              style={{ color: "rgba(58,142,255,0.5)" }}>
              Garanties
            </div>
            <ul className="flex flex-col gap-3">
              {GUARANTEES.map((g) => (
                <li key={g} className="flex items-center gap-2">
                  <span aria-hidden className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.4)" }}>✦</span>
                  <span className="text-[0.82rem]" style={{ color: "#3a4055" }}>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.05)",
          marginBottom: "1.5rem",
        }} />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "#3a4055" }}>
            © {new Date().getFullYear()} AirplaneStore — Tous droits réservés
          </div>

          {/* Payment logos */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["Visa", "Mastercard", "CB", "PayPal", "Apple Pay", "3x sans frais"].map(p => (
              <div key={p}
                className="px-2.5 py-1 font-mono text-[0.55rem] font-semibold tracking-wide"
                style={{
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.28)",
                }}>
                {p}
              </div>
            ))}
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.06)" }} />
            <span className="font-mono text-[0.55rem] tracking-[0.12em] uppercase" style={{ color: "#2a3040" }}>
              🔒 Paiement sécurisé
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
