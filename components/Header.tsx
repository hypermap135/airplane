"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart, useCartDrawer } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

const NAV_LINKS = [
  { href: "/collections/all",      label: "Collection" },
  { href: "/collections/airbus",   label: "Airbus" },
  { href: "/collections/boeing",   label: "Boeing" },
  { href: "/collections/concorde", label: "Concorde" },
  { href: "/collections/jet",      label: "Jet privé" },
  { href: "/collections/packs",    label: "Packs" },
  { href: "/faq",                  label: "FAQ" },
];

export default function Header() {
  const { count }  = useCart();
  const { toggle } = useCartDrawer();
  const wishlist   = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else          document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-brand text-white">
      {/* ── Top row : logo, search hint, actions ── */}
      <div className="mx-auto flex h-[64px] max-w-[1400px] items-center gap-4 md:gap-10 px-4 md:px-8">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="md:hidden inline-grid w-10 h-10 place-items-center rounded"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <path d="M4 4L20 20" />
                <path d="M20 4L4 20" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold text-white shrink-0"
          style={{ textDecoration: "none", fontSize: "1.1rem", letterSpacing: "0.02em" }}
        >
          <span
            aria-hidden
            className="inline-grid place-items-center rounded-full bg-white text-brand"
            style={{ width: 30, height: 30, fontSize: "0.95rem", fontWeight: 900 }}
          >
            ✈
          </span>
          <span className="hidden xs:inline sm:inline uppercase tracking-wide">Airplanestore</span>
        </Link>

        {/* Desktop nav — spacer pushes actions right, nav breathes */}
        <nav className="hidden md:flex flex-1 items-center gap-7">
          {NAV_LINKS.map(l => {
            const active = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                style={{
                  textDecoration: "none",
                  opacity: active ? 1 : 0.82,
                  borderBottom: active ? "2px solid #fff" : "2px solid transparent",
                  paddingBottom: 3,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-3 md:ml-auto shrink-0">
          <Link
            href="/favoris"
            aria-label={`Favoris${wishlist.count ? ` (${wishlist.count})` : ""}`}
            className="relative inline-grid w-10 h-10 place-items-center rounded"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.count > 0 ? "#ffffff" : "none"} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlist.count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 grid place-items-center rounded-full text-[10px] font-bold bg-white text-brand">
                {wishlist.count}
              </span>
            )}
          </Link>

          <button
            onClick={toggle}
            aria-label="Panier"
            className="relative inline-grid w-10 h-10 place-items-center rounded"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6" />
              <circle cx="10" cy="21" r="1.3" />
              <circle cx="18" cy="21" r="1.3" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 grid place-items-center rounded-full text-[10px] font-bold bg-white text-brand">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      {menuOpen && (
        <nav className="md:hidden bg-brand-dark border-t border-white/10 py-2">
          {NAV_LINKS.map(l => {
            const active = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-white text-sm font-medium border-b border-white/5"
                style={{
                  textDecoration: "none",
                  opacity: active ? 1 : 0.85,
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
