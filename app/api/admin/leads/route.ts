import { NextResponse } from "next/server";
import { listLeads, markSent } from "@/lib/leads-store";
import { cartReminderJ1, cartReminderJ3, sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  const leads = await listLeads();
  // Ordre inverse : les plus récents d'abord
  const sorted = [...leads].sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ leads: sorted, count: sorted.length });
}

/**
 * POST /api/admin/leads
 *   body: { email: string, kind: "j1" | "j3" }
 * Envoie un rappel MANUEL au lead spécifié (indépendant du cron).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { email?: string; kind?: "j1" | "j3" } | null;
  if (!body?.email || !body.kind) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const leads = await listLeads();
  const lead = leads.find((l) => l.email === body.email);
  if (!lead) return NextResponse.json({ error: "lead_not_found" }, { status: 404 });

  const tpl = body.kind === "j1" ? cartReminderJ1(lead.cartValue) : cartReminderJ3(lead.cartValue);
  const r = await sendEmail({
    to: lead.email,
    subject: tpl.subject,
    htmlContent: tpl.html,
    tags: ["cart-abandonment", body.kind, "manual"],
  });
  if (r.ok) await markSent(lead.email, body.kind);

  return NextResponse.json({ ok: r.ok, error: r.error, dryRun: r.error === "no_brevo_key" });
}
