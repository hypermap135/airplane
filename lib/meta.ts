/**
 * Meta Pixel + Conversions API helpers.
 *
 * Client-side: fbq('track', ...) calls fire the browser Pixel.
 * Server-side: same events also forwarded to /api/meta-capi which
 * relays them to Meta's Conversions API for iOS-resilient tracking.
 *
 * Each event is sent once with a shared event_id (deduplication on
 * Meta's side: if both client + server arrive with same event_id,
 * Meta counts it as one event).
 */

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Search"
  | "Lead";

export type MetaEventParams = {
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  content_category?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  currency?: string;
  value?: number;
  num_items?: number;
};

/* ─── Client-side event firing ────────────────────────────────────────────── */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function generateEventId(): string {
  // Random 32-char hex — used for client+server dedup
  const bytes = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readUtm(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const out: Record<string, string> = {};
  document.cookie.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    if (k && k.startsWith("utm_") && v) out[k] = decodeURIComponent(v);
  });
  return out;
}

/**
 * Fire a Meta event from the client. Sends to Pixel (browser) AND to
 * /api/meta-capi (server-side) with the same event_id for dedup.
 */
export function trackMeta(name: MetaEventName, params: MetaEventParams = {}): void {
  if (typeof window === "undefined") return;

  const eventId = generateEventId();

  // 1. Browser pixel
  if (window.fbq) {
    window.fbq("track", name, params, { eventID: eventId });
  }

  // 2. Server-side CAPI (fire-and-forget)
  const utm = readUtm();
  fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: name,
      event_id: eventId,
      event_source_url: window.location.href,
      params,
      utm,
    }),
    keepalive: true, // ensures the request goes out even on page navigation
  }).catch(() => {
    // silent — CAPI is best-effort
  });
}
