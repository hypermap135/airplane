/**
 * Cookie consent — TCF-lite. On stocke un cookie `airplanestore.consent`
 * avec la valeur "granted" | "denied". Le banner (components/CookieBanner)
 * gère l'UI. Les composants tracking (MetaPixel, GTM/GA4) écoutent l'event
 * `consent:changed` déclenché après clic.
 *
 * On reste minimal : pas de granularité par catégorie (statistics / marketing)
 * — le e-shop actuel n'a que Meta Pixel + GA4 + CAPI, tous "marketing".
 * Un refus bloque les 3 d'un coup. Suffisant CNIL 2024 pour un site
 * B2C simple sans profiling avancé.
 */

export const CONSENT_COOKIE = "airplanestore.consent";
export const CONSENT_EVENT = "consent:changed";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 6 mois (recommandation CNIL)

export type ConsentValue = "granted" | "denied";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  const v = match.split("=")[1];
  return v === "granted" || v === "denied" ? v : null;
}

export function writeConsent(v: ConsentValue): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${v}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax; Secure`;
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }));
  } catch { /* noop */ }
}

export function onConsentChange(cb: (v: ConsentValue) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<ConsentValue>).detail;
    if (detail === "granted" || detail === "denied") cb(detail);
  };
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
