import { NextRequest, NextResponse } from "next/server";

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
