"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { COLLECTIONS } from "@/lib/products";

const NAV_LINKS = [
  { href: "/collections/all",     label: "Collection", primary: true },
  { href: "/collections/airbus",  label: "Airbus" },
  { href: "/collections/boeing",  label: "Boeing" },
  { href: "/collections/concorde",label: "Concorde" },
  { href: "/collections/chasse",  label: "Militaire" },
  { href: "/collections/packs",   label: "Packs" },
  { href: "/faq",                 label: "FAQ" },
];

export default function Header() {
  const { count } = useCart();
  const { toggle } = useCartDrawer();
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [announceClosed, setAnnounceClosed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change (Next.js doesn't need router for this; close on scroll)
  useEffect(() => {
    if (menuOpen && scrolled) setMenuOpen(false);
  }, [scrolled, menuOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      {/* ── Announcement bar ───────────────────────────── */}
      {!announceClosed && (
        <div className="relative flex items-center justify-center text-center px-8 py-2.5"
          style={{
            background: "linear-gradient(90deg, rgba(18,40,100,0.95) 0%, rgba(30,60,160,0.95) 50%, rgba(18,40,100,0.95) 100%)",
            borderBottom: "1px solid rgba(58,142,255,0.2)",
            backdropFilter: "blur(12px)",
          }}>
          <span className="font-mono text-[0.6rem] tracking-[0.22em] uppercase" style={{ color: "rgba(180,210,255,0.8)" }}>
            ✈ Offre limitée&nbsp;·&nbsp;
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)", margin: "0 0.4rem" }}>
            –10% sur votre 1re commande avec
          </span>
          <span className="font-mono text-[0.62rem] font-bold tracking-[0.18em] px-2 py-0.5 mx-1"
            style={{
              background: "linear-gradient(135deg, #c8ccd0, #f0f2f5)",
              color: "#010108",
              borderRadius: 4,
            }}>
            TAKEOFF10
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase hidden sm:inline" style={{ color: "rgba(255,255,255,0.3)", marginLeft: "0.5rem" }}>
            · Livraison offerte dès 100€
          </span>
          <button
            onClick={() => setAnnounceClosed(true)}
            aria-label="Fermer"
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: "white", fontSize: "1rem", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Header bar ─────────────────────────────────── */}
      <header
        ref={headerRef}
        className="transition-all duration-500"
        style={{
          background: scrolled ? "rgba(1,1,8,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between px-5 md:px-12 xl:px-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" style={{ textDecoration: "none" }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
              <defs>
                <linearGradient id="hdr-chrome" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#9ea8b8" />
                </linearGradient>
              </defs>
              <path d="M16 3 L19 14 L29 16 L19 18 L16 29 L13 18 L3 16 L13 14 Z"
                fill="url(#hdr-chrome)" opacity="0.95" />
            </svg>
            <span className="font-black text-[0.78rem] tracking-[0.2em] uppercase text-white">
              AIRPLANESTORE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-[0.6rem] tracking-[0.2em] uppercase transition-colors duration-200"
                style={{ color: l.primary ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.42)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={e => (e.currentTarget.style.color = l.primary ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.42)")}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={toggle}
              aria-label="Ouvrir le panier"
              className="relative inline-flex items-center gap-2 transition-all duration-300"
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <CartIcon />
              <span className="hidden sm:inline font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white">Panier</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full text-[0.62rem] font-bold"
                  style={{
                    background: "linear-gradient(135deg, #d0d4da 0%, #ffffff 100%)",
                    color: "#010108",
                  }}>
                  {count}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="md:hidden inline-flex items-center justify-center transition-all duration-200"
              style={{
                width: 38, height: 38,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          style={{
            background: "rgba(2,2,12,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: menuOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
          <nav className="px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)";
                }}
              >
                <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase" style={{ color: "rgba(58,142,255,0.5)" }}>✦</span>
                <span className="font-mono text-[0.65rem] tracking-[0.18em] uppercase">{l.label}</span>
              </Link>
            ))}
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => { toggle(); setMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-[0.65rem] tracking-[0.2em] uppercase transition-all"
                style={{
                  background: "rgba(58,142,255,0.08)",
                  border: "1px solid rgba(58,142,255,0.25)",
                  color: "rgba(100,170,255,0.9)",
                }}
              >
                <CartIcon />
                Panier{count > 0 ? ` (${count})` : ""}
              </button>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 5h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"
        stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="21" r="1.3" fill="rgba(255,255,255,0.7)" />
      <circle cx="18" cy="21" r="1.3" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}
