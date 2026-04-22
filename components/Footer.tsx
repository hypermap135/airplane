"use client";

import Link from "next/link";

const NAV = [
  {
    title: "Collections",
    links: [
      { href: "/collections/airbus",        label: "Airbus" },
      { href: "/collections/boeing",        label: "Boeing" },
      { href: "/collections/concorde",      label: "Concorde" },
      { href: "/collections/packs",         label: "Packs & offres" },
      { href: "/collections/all",           label: "Tout voir" },
    ],
  },
  {
    title: "Boutique",
    links: [
      { href: "/a-propos",  label: "À propos" },
      { href: "/contact",   label: "Contact" },
      { href: "/faq",       label: "FAQ" },
      { href: "/cgv",       label: "CGV" },
    ],
  },
  {
    title: "Garanties",
    links: [
      { href: "#", label: "Livraison 7–15 jours" },
      { href: "#", label: "Livraison offerte dès 100€" },
      { href: "#", label: "Retour 30 jours" },
      { href: "#", label: "Paiement sécurisé" },
    ],
  },
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
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 md:gap-8 pb-14">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
                <path d="M16 3 L19 14 L29 16 L19 18 L16 29 L13 18 L3 16 L13 14 Z"
                  fill="url(#foot-chrome)" opacity="0.9" />
                <defs>
                  <linearGradient id="foot-chrome" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#9ea8b8" />
                  </linearGradient>
                </defs>
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
                { icon: "★", text: "4.9 / 5 · +2 000 clients" },
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
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.05)",
          marginBottom: "1.5rem",
        }} />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "#3a4055" }}>
            © {new Date().getFullYear()} AirplaneStore — Tous droits réservés
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "#3a4055" }}>
              Est. Paris · France & Europe
            </span>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.06)" }} />
            <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: "#3a4055" }}>
              Résine · LED · 1/147
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
