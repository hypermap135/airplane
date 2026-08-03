/**
 * Cron endpoint — envoie les rappels panier abandonné.
 *
 * J+1 : email standard "vous avez oublié quelque chose"
 * J+3 : email avec −10% (code TAKEOFF10)
 *
 * Déclenché quotidiennement par Vercel Cron (voir vercel.json).
 * Protégé par header Bearer `CRON_SECRET` — sans quoi n'importe qui
 * pourrait faire spammer les leads.
 *
 * Idempotent : chaque lead a un flag `sent.j1` / `sent.j3` avec timestamp,
 * on ne renvoie jamais deux fois le même rappel.
 */

import { NextRequest, NextResponse } from "next/server";
import { listLeads, markSent, type Lead } from "@/lib/leads-store";
import { cartReminderJ1, cartReminderJ3, sendEmail } from "@/lib/email";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const J1_MIN = 20 * 60 * 60 * 1000;  // 20h après capture (marge pour le cron)
const J1_MAX = 48 * 60 * 60 * 1000;  // pas au-delà de 48h (sinon zone J+3)
const J3_MIN = 3 * ONE_DAY_MS;
const J3_MAX = 7 * ONE_DAY_MS;       // au-delà de 7j on abandonne

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function shouldSendJ1(lead: Lead, now: number): boolean {
  if (lead.sent?.j1) return false;
  const age = now - lead.createdAt;
  return age >= J1_MIN && age <= J1_MAX;
}

function shouldSendJ3(lead: Lead, now: number): boolean {
  if (lead.sent?.j3) return false;
  const age = now - lead.createdAt;
  return age >= J3_MIN && age <= J3_MAX;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const leads = await listLeads();
  const now = Date.now();
  const results: Array<{ email: string; kind: "j1" | "j3"; ok: boolean; error?: string }> = [];

  for (const lead of leads) {
    if (shouldSendJ1(lead, now)) {
      const tpl = cartReminderJ1(lead.cartValue);
      const r = await sendEmail({
        to: lead.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        tags: ["cart-abandonment", "j1"],
      });
      results.push({ email: lead.email, kind: "j1", ok: r.ok, error: r.error });
      if (r.ok) await markSent(lead.email, "j1");
      continue; // ne pas J3 le même jour
    }
    if (shouldSendJ3(lead, now)) {
      const tpl = cartReminderJ3(lead.cartValue);
      const r = await sendEmail({
        to: lead.email,
        subject: tpl.subject,
        htmlContent: tpl.html,
        tags: ["cart-abandonment", "j3"],
      });
      results.push({ email: lead.email, kind: "j3", ok: r.ok, error: r.error });
      if (r.ok) await markSent(lead.email, "j3");
    }
  }

  return NextResponse.json({
    ok: true,
    totalLeads: leads.length,
    sent: results.filter((r) => r.ok).length,
    errors: results.filter((r) => !r.ok),
  });
}
