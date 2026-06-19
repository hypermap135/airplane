"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart, useCartDrawer } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { COLLECTIONS } from "@/lib/products";

const NAV_LINKS = [
  { href: "/collections/all",      label: "Collection", primary: true },
  { href: "/collections/airbus",   label: "Airbus" },
  { href: "/collections/boeing",   label: "Boeing" },
  { href: "/collections/concorde", label: "Concorde" },
  { href: "/collections/jet",      label: "Jet privé" },
  { href: "/collections/packs",    label: "Packs" },
  { href: "/faq",                  label: "FAQ" },
];

export default function Header() {
  const { count } = useCart();
  const { toggle } = useCartDrawer();
  const wishlist = useWishlist();
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [announceClosed, setAnnounceClosed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change / scroll
  useEffect(() => {
    if (menuOpen && scrolled) setMenuOpen(false);
  }, [scrolled, menuOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      {/* ── Announcement bar ───────────────────────────── */}
      {!announceClosed && (
        <div
          className="relative flex items-center justify-center text-center px-8 py-2.5"
          style={{
            background:
              "linear-gradient(90deg, rgba(18,40,100,0.95) 0%, rgba(30,60,160,0.95) 50%, rgba(18,40,100,0.95) 100%)",
            borderBottom: "1px solid rgba(58,142,255,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            className="font-mono text-[0.6rem] tracking-[0.22em] uppercase"
            style={{ color: "rgba(180,210,255,0.8)" }}
          >
            ✈ Offre limitée&nbsp;·&nbsp;
          </span>
          <span
            className="font-mono text-[0.6rem] tracking-[0.18em] uppercase"
            style={{ color: "rgba(255,255,255,0.5)", margin: "0 0.4rem" }}
          >
            –10% sur votre 1re commande avec
          </span>
          <span
            className="font-mono text-[0.62rem] font-bold tracking-[0.18em] px-2 py-0.5 mx-1"
            style={{
              background: "linear-gradient(135deg, #c8ccd0, #f0f2f5)",
              color: "#010108",
              borderRadius: 4,
            }}
          >
            TAKEOFF10
          </span>
          <span
            className="font-mono text-[0.6rem] tracking-[0.18em] uppercase hidden sm:inline"
            style={{ color: "rgba(255,255,255,0.3)", marginLeft: "0.5rem" }}
          >
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
          background: scrolled ? "rgba(1,1,8,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between px-5 md:px-12 xl:px-20">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            style={{ textDecoration: "none" }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden
              style={{
                transition: "filter 0.3s ease, transform 0.4s ease",
              }}
              className="group-hover:[filter:drop-shadow(0_0_8px_rgba(58,142,255,0.55))] group-hover:rotate-[8deg]"
            >
              <defs>
                <linearGradient id="hdr-chrome" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="55%" stopColor="#cfd6e2" />
                  <stop offset="100%" stopColor="#3a8eff" />
                </linearGradient>
              </defs>
              {/* Top-down jet airliner silhouette */}
              <path
                d="M16 3 L17.4 4.6 L17.4 11 L29 16 L29 17.6 L17.4 14.6 L17.4 22.6 L21.6 25.2 L21.6 26.8 L16 25.4 L10.4 26.8 L10.4 25.2 L14.6 22.6 L14.6 14.6 L3 17.6 L3 16 L14.6 11 L14.6 4.6 Z"
                fill="url(#hdr-chrome)"
                opacity="0.96"
              />
              {/* Cockpit window detail */}
              <ellipse cx="16" cy="6.5" rx="0.9" ry="1.3" fill="rgba(58,142,255,0.5)" />
            </svg>
            <span
              className="font-black tracking-[0.2em] uppercase text-white transition-all duration-300"
              style={{
                fontSize: "0.95rem",
                textShadow: "0 0 0px rgba(255,255,255,0)",
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLSpanElement).style.textShadow =
                  "0 0 18px rgba(255,255,255,0.35)")
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLSpanElement).style.textShadow =
                  "0 0 0px rgba(255,255,255,0)")
              }
            >
              AIRPLANESTORE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => {
              const isActive = pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative font-mono text-[0.6rem] tracking-[0.2em] uppercase transition-colors duration-200 group/navlink"
                  style={{
                    color: isActive
                      ? "#ffffff"
                      : l.primary
                      ? "rgba(255,255,255,0.75)"
                      : "rgba(255,255,255,0.42)",
                    textDecoration: "none",
                    paddingBottom: "4px",
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "#ffffff")
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = isActive
                      ? "#ffffff"
                      : l.primary
                      ? "rgba(255,255,255,0.75)"
                      : "rgba(255,255,255,0.42)")
                  }
                >
                  {l.label}

                  {/* Sliding underline on hover */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "1px",
                      background: "rgba(255,255,255,0.5)",
                      transform: "scaleX(0)",
                      transformOrigin: "left center",
                      transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                      display: "block",
                    }}
                    className="group-hover/navlink:[transform:scaleX(1)!important]"
                  />

                  {/* Active blue dot */}
                  {isActive && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        bottom: -5,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "rgba(58,142,255,0.85)",
                        boxShadow: "0 0 6px rgba(58,142,255,0.6)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist heart pill */}
            <Link
              href="/favoris"
              aria-label={`Mes favoris${wishlist.count > 0 ? ` (${wishlist.count})` : ""}`}
              className="relative inline-flex items-center justify-center transition-all duration-300"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(226,75,74,0.5)";
                (e.currentTarget as HTMLElement).style.background = "rgba(226,75,74,0.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.count > 0 ? "#ff4a4a" : "none"} stroke={wishlist.count > 0 ? "#ff4a4a" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlist.count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full text-[0.62rem] font-bold"
                  style={{
                    background: "#ff4a4a",
                    color: "#fff",
                  }}
                >
                  {wishlist.count}
                </span>
              )}
            </Link>

            {/* Cart / PANIER button — premium pill */}
            <button
              onClick={toggle}
              aria-label="Ouvrir le panier"
              className="relative inline-flex items-center gap-2 transition-all duration-300"
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "rgba(58,142,255,0.5)";
                btn.style.background = "rgba(58,142,255,0.1)";
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "rgba(255,255,255,0.15)";
                btn.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <CartIcon />
              <span className="hidden sm:inline font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white">
                Panier
              </span>
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full text-[0.62rem] font-bold"
                  style={{
                    background: "linear-gradient(135deg, #d0d4da 0%, #ffffff 100%)",
                    color: "#010108",
                  }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="md:hidden inline-flex items-center justify-center transition-all duration-200"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 16,
                  height: 16,
                  position: "relative",
                }}
              >
                {menuOpen ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 2L14 14M14 2L2 14"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4h12M2 8h12M2 12h12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{
            background: "rgba(2,2,12,0.97)",
            backdropFilter: "blur(20px)",
            borderTop: menuOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <nav className="px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => {
              const isActive =
                pathname === l.href || pathname?.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200"
                  style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)" }}
                  onMouseEnter={e => {
                    const a = e.currentTarget as HTMLAnchorElement;
                    a.style.background = "rgba(255,255,255,0.04)";
                    a.style.color = "#ffffff";
                  }}
                  onMouseLeave={e => {
                    const a = e.currentTarget as HTMLAnchorElement;
                    a.style.background = "transparent";
                    a.style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.7)";
                  }}
                >
                  <span
                    className="font-mono text-[0.62rem] tracking-[0.22em] uppercase"
                    style={{
                      color: isActive
                        ? "rgba(58,142,255,0.85)"
                        : "rgba(58,142,255,0.5)",
                    }}
                  >
                    ✦
                  </span>
                  <span className="font-mono text-[0.65rem] tracking-[0.18em] uppercase">
                    {l.label}
                  </span>
                  {isActive && (
                    <span
                      aria-hidden
                      style={{
                        marginLeft: "auto",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "rgba(58,142,255,0.85)",
                        boxShadow: "0 0 6px rgba(58,142,255,0.6)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
            <div
              className="mt-3 pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={() => {
                  toggle();
                  setMenuOpen(false);
                }}
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
      <path
        d="M3 5h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.3" fill="rgba(255,255,255,0.7)" />
      <circle cx="18" cy="21" r="1.3" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}
