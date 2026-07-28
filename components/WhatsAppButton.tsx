"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Floating WhatsApp button. Hidden on /admin/* (handled by SiteChrome
 * which doesn't render us there at all) and on /cart-like overlays.
 *
 * Phone number lives in NEXT_PUBLIC_WHATSAPP_NUMBER (international
 * format, no +, no spaces) — defaults to a placeholder if unset so dev
 * environments don't open random numbers.
 */
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "33761477922";

export default function WhatsAppButton() {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Skip on checkout/account-like routes (none yet, but future-proof).
  const hideOn = ["/admin"];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  if (!mounted) return null;

  // Default pre-filled message — adapts to product pages.
  const isProduct = pathname.startsWith("/products/");
  const baseMsg = isProduct
    ? "Bonjour, j'ai une question sur cette maquette : " +
      (typeof window !== "undefined" ? window.location.href : "")
    : "Bonjour, j'ai une question sur les maquettes AirplaneStore.";
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMsg)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      // z-index sous la sticky bar CTA (z-30) sur PDP pour éviter le
      // chevauchement. Bottom augmenté sur PDP (5rem) pour laisser la place
      // au CTA sticky. Sur autres pages, remonté à 1.25rem.
      className="fixed z-20 transition-transform hover:scale-110"
      style={{
        right: "1.25rem",
        bottom: isProduct ? "5.5rem" : "1.25rem",
        width: 56,
        height: 56,
        borderRadius: 999,
        background: "linear-gradient(135deg,#25D366 0%,#128C7E 100%)",
        boxShadow: "0 8px 28px rgba(37,211,102,0.45), 0 2px 6px rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="white"
        aria-hidden
      >
        <path d="M16.04 3C9.42 3 4.06 8.36 4.06 14.98c0 2.12.56 4.18 1.62 6L4 28l7.2-1.88a12 12 0 005.83 1.5h.01c6.62 0 11.98-5.37 11.98-11.98C29.02 8.37 23.66 3 16.04 3zm0 21.86h-.01a9.96 9.96 0 01-5.07-1.39l-.36-.22-4.27 1.12 1.14-4.17-.24-.38a9.96 9.96 0 0115.43-12.4 9.94 9.94 0 012.92 7.06c0 5.5-4.46 9.97-9.96 9.97zm5.45-7.46c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.49 1.69.62.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
