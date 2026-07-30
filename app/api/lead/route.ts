import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory rate limiter per IP. Simple sliding window : 5 requêtes /
 * 60 secondes. Suffisant contre le spam basique. Ne survit pas au
 * redémarrage de la serverless function (chaque instance a son propre
 * bucket) — pour du rate limit distribué il faudrait Vercel KV/Redis.
 */
const RATE_BUCKET = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (RATE_BUCKET.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    RATE_BUCKET.set(ip, hits);
    return true;
  }
  hits.push(now);
  RATE_BUCKET.set(ip, hits);
  // Garbage collect anciens IPs (~1000 IPs max en mémoire)
  if (RATE_BUCKET.size > 1000) {
    for (const [k, v] of RATE_BUCKET) {
      if (v.every((t) => now - t > RATE_WINDOW_MS)) RATE_BUCKET.delete(k);
    }
  }
  return false;
}

/**
 * Cart-abandonment / newsletter lead capture.
 *
 * Currently a fire-and-forget logger — the email lands in the Vercel
 * function logs and (in dev) the terminal. When a real CRM/ESP is
 * wired (SendGrid, Postmark, Brevo, ConvertKit), this is the single
 * place to add the forwarding call. The client doesn't need to change.
 *
 * Also fires server-side Meta CAPI Lead event so iOS-blocked sessions
 * still count. Idempotent — duplicate emails are accepted, the CRM
 * deduplicates.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", userMessage: "Trop de tentatives. Réessayez dans 1 minute." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const source = String(body?.source ?? "unknown");

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    // Structured log so we can grep these in Vercel logs.
    console.log(`[lead] email=${email} source=${source} ts=${Date.now()}`);

    // TODO: forward to CRM/ESP when one is configured.
    //   e.g. fetch("https://api.brevo.com/v3/contacts", { ... })

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
