"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { onConsentChange, readConsent } from "@/lib/consent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/**
 * Google Tag Manager container — gated par consent RGPD.
 * GTM sert de proxy pour GA4 + tout autre pixel qu'on voudrait
 * ajouter sans redeploy (Hotjar, Clarity, LinkedIn, TikTok, etc.).
 *
 * Sans GTM_ID configuré, ne rend rien — le site marche pareil.
 */
export default function GTM() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (readConsent() === "granted") setEnabled(true);
    const off = onConsentChange((v) => setEnabled(v === "granted"));
    return off;
  }, []);

  if (!GTM_ID || !enabled) return null;

  return (
    <Script id="gtm" strategy="lazyOnload">{`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `}</Script>
  );
}
