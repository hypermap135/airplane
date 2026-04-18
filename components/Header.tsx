"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, useCartDrawer } from "@/lib/cart";
import { COLLECTIONS } from "@/lib/products";

export default function Header() {
  const { count } = useCart();
  const { toggle } = useCartDrawer();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-ink-900/85 backdrop-blur-xl border-b border-ink-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <LogoMark />
          <span className="display text-sm text-white">AIRPLANESTORE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[0.78rem] font-medium tracking-wide2 uppercase">
          <Link href="/collections/all" className="text-white/80 hover:text-white transition">
            Collection
          </Link>
          {COLLECTIONS.slice(0, 3).map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="text-white/70 hover:text-white transition"
            >
              {c.label}
            </Link>
          ))}
          <Link href="/collections/packs" className="text-white/70 hover:text-white transition">
            Packs
          </Link>
          <Link href="/faq" className="text-white/70 hover:text-white transition">
            FAQ
          </Link>
        </nav>

        <button
          onClick={toggle}
          className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 hover:border-white/40 transition"
          aria-label="Ouvrir le panier"
        >
          <CartIcon />
          <span className="display text-[0.72rem] text-white">Panier</span>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-chrome-grad text-ink-900 text-[0.68rem] font-bold">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="chrome" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C8CCD0" />
        </linearGradient>
      </defs>
      <path
        d="M16 3 L19 14 L29 16 L19 18 L16 29 L13 18 L3 16 L13 14 Z"
        fill="url(#chrome)"
        opacity="0.95"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 5h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.3" fill="currentColor" />
      <circle cx="18" cy="21" r="1.3" fill="currentColor" />
    </svg>
  );
}
