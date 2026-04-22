"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { COLLECTIONS } from "@/lib/products";

export default function Header() {
  const { count } = useCart();
  const { toggle } = useCartDrawer();
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(1,1,8,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-[65px] max-w-[1440px] items-center justify-between px-6 md:px-12 xl:px-20">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" style={{ textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden>
            <defs>
              <linearGradient id="header-chrome" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#9ea8b8" />
              </linearGradient>
            </defs>
            <path d="M16 3 L19 14 L29 16 L19 18 L16 29 L13 18 L3 16 L13 14 Z"
              fill="url(#header-chrome)" opacity="0.95" />
          </svg>
          <span className="font-black text-[0.8rem] tracking-[0.2em] uppercase text-white">
            AIRPLANESTORE
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/collections/all"
            className="font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          >
            Collection
          </Link>
          {COLLECTIONS.slice(0, 3).map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              {c.label}
            </Link>
          ))}
          <Link href="/collections/packs"
            className="font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            Packs
          </Link>
          <Link href="/faq"
            className="font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            FAQ
          </Link>
        </nav>

        {/* Cart */}
        <button
          onClick={toggle}
          aria-label="Ouvrir le panier"
          className="relative inline-flex items-center gap-2 transition-all duration-300"
          style={{
            padding: "0.5rem 1rem",
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
          <span className="font-mono text-[0.62rem] tracking-[0.2em] uppercase text-white">Panier</span>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full text-[0.65rem] font-bold"
              style={{
                background: "linear-gradient(135deg, #d0d4da 0%, #ffffff 100%)",
                color: "#010108",
              }}>
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
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
