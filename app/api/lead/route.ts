import { NextRequest, NextResponse } from "next/server";
import { checkRate, extractIp } from "@/lib/rate-limit";
import { saveLead } from "@/lib/leads-store";

/**
 * Cart-abandonment / newsletter lead capture.
 *
 * Persiste sur GitHub storage (data/leads.json) — un cron J+1/J+3 lit
 * ce fichier et envoie les rappels via Brevo (voir app/api/cron/cart-reminders).
 *
 * Rate limit : 5 requêtes / 60s par IP via lib/rate-limit partagé.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = extractIp(req);
    const rl = checkRate("lead", ip, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", userMessage: "Trop de tentatives. Réessayez dans 1 minute." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const source = String(body?.source ?? "unknown");
    const cartValue = typeof body?.cartValue === "number" ? body.cartValue : undefined;
    const cartItems = Array.isArray(body?.cartItems) ? body.cartItems : undefined;

    if (!email || !email.includes("@") || email.length > 200) {
      return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
    }

    console.log(`[lead] email=${email} source=${source} ts=${Date.now()}`);

    // Persist en GitHub storage — silencieux si non configuré (pas de blocker)
    try {
      await saveLead({ email, source, cartValue, cartItems, createdAt: Date.now() });
    } catch (err) {
      console.warn("[lead] saveLead failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
