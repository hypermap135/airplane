"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONSENT_COOKIE, readConsent, writeConsent } from "@/lib/consent";

/**
 * Banner RGPD minimal. Affiché tant que le cookie `airplanestore.consent`
 * n'existe pas. 3 CTA : Accepter, Refuser, Personnaliser (renvoie vers
 * /cookies). Le refus bloque Meta Pixel, GTM, CAPI côté client (les
 * composants écoutent l'event `consent:changed`).
 *
 * Design volontairement sobre — carte en bas, pas bloquant, pas de
 * dark pattern (les 2 boutons ont la même taille visuelle).
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
    const current = readConsent();
    if (current === null) setVisible(true);
  }, []);

  // Le banner n'a pas de sens dans l'admin — les gestionnaires n'ont pas
  // à donner leur consentement pour du tracking marketing.
  if (isAdmin) return null;
  if (!mounted || !visible) return null;

  const accept = () => { writeConsent("granted"); setVisible(false); };
  const deny   = () => { writeConsent("denied");  setVisible(false); };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentement cookies"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "1rem",
        transform: "translateX(-50%)",
        zIndex: 60,
        width: "min(720px, calc(100% - 2rem))",
        background: "#fff",
        border: "1px solid var(--ink-line, #e6e8eb)",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        padding: "1rem 1.25rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ fontSize: 13, color: "var(--ink-900, #0e1013)", lineHeight: 1.5, margin: 0 }}>
          🍪 Nous utilisons des cookies pour mesurer l'audience du site et
          personnaliser les publicités Meta / Google. Vous pouvez accepter,
          refuser, ou consulter{" "}
          <Link href="/cookies" style={{ textDecoration: "underline", color: "var(--brand-blue, #1c7ee6)" }}>
            notre politique cookies
          </Link>
          . Les cookies essentiels au panier restent actifs.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            onClick={deny}
            style={{
              padding: "0.6rem 1.1rem",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 999,
              border: "1px solid var(--ink-line, #d0d3d8)",
              background: "#fff",
              color: "var(--ink-900, #0e1013)",
              cursor: "pointer",
            }}
          >
            Refuser
          </button>
          <button
            onClick={accept}
            style={{
              padding: "0.6rem 1.1rem",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 999,
              border: "1px solid #0e1013",
              background: "#0e1013",
              color: "#fff",
              cursor: "pointer",
            }}
            data-consent-cookie={CONSENT_COOKIE}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
