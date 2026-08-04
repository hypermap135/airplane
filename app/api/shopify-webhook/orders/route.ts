/**
 * Shopify webhook — orders/create.
 *
 * À déclarer côté Shopify Admin :
 *   Paramètres → Notifications → Webhooks → Créer un webhook
 *     Event    : Order creation
 *     Format   : JSON
 *     URL      : https://airplanestore.fr/api/shopify-webhook/orders
 *     Version  : 2024-07
 *     Secret   : (copier dans SHOPIFY_WEBHOOK_SECRET sur Vercel)
 *
 * Ce endpoint :
 *  1. Vérifie la signature HMAC pour rejeter les faux appels
 *  2. Envoie un event `Purchase` à Meta CAPI avec eventID = order_id
 *     (dedup avec un pixel client éventuellement fired sur le page "merci")
 *  3. Efface le lead correspondant du store (le client a acheté → ne pas
 *     lui envoyer les rappels J+1/J+3)
 */

import { NextRequest, NextResponse } from "next/server";
import { listLeads, markSent } from "@/lib/leads-store";
import { sendEmail } from "@/lib/email";

const PIXEL_ID = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const CAPI_TOKEN = process.env.META_CAPI_TOKEN ?? "";
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";
const API_VERSION = "v21.0";

async function verifyShopifyHmac(rawBody: string, hmacHeader: string | null): Promise<boolean> {
  if (!hmacHeader || !WEBHOOK_SECRET) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // Timing-safe compare
  if (b64.length !== hmacHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < b64.length; i++) diff |= b64.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
  return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

type ShopifyOrder = {
  id: number;
  order_number?: number;
  total_price?: string;
  currency?: string;
  email?: string;
  customer?: { email?: string; first_name?: string; last_name?: string; phone?: string };
  line_items?: Array<{ product_id?: number; variant_id?: number; quantity?: number; price?: string }>;
  client_details?: { user_agent?: string; browser_ip?: string };
};

async function sendPurchaseToMeta(order: ShopifyOrder): Promise<{ ok: boolean; error?: string }> {
  if (!PIXEL_ID || !CAPI_TOKEN) return { ok: false, error: "no_capi_config" };

  const email = order.customer?.email ?? order.email ?? "";
  const phone = order.customer?.phone ?? "";
  const userData: Record<string, unknown> = {};
  if (email) userData.em = [await sha256Hex(email)];
  if (phone) userData.ph = [await sha256Hex(phone)];
  if (order.customer?.first_name) userData.fn = [await sha256Hex(order.customer.first_name)];
  if (order.customer?.last_name)  userData.ln = [await sha256Hex(order.customer.last_name)];
  if (order.client_details?.user_agent) userData.client_user_agent = order.client_details.user_agent;
  if (order.client_details?.browser_ip) userData.client_ip_address = order.client_details.browser_ip;

  const contents = (order.line_items ?? []).map((li) => ({
    id: String(li.variant_id ?? li.product_id ?? ""),
    quantity: li.quantity ?? 1,
    item_price: parseFloat(li.price ?? "0"),
  }));

  const event = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: `order_${order.id}`, // dedup vs client Purchase si un jour on l'ajoute
    action_source: "website",
    user_data: userData,
    custom_data: {
      currency: order.currency ?? "EUR",
      value: parseFloat(order.total_price ?? "0"),
      contents,
      num_items: contents.reduce((n, c) => n + c.quantity, 0),
      order_id: String(order.id),
    },
  };

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn("[shopify-webhook] CAPI non-200", res.status, data);
      return { ok: false, error: `capi_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.warn("[shopify-webhook] CAPI fetch failed", err);
    return { ok: false, error: "capi_fetch_failed" };
  }
}

async function clearLeadForEmail(email: string): Promise<void> {
  if (!email) return;
  const leads = await listLeads();
  const lead = leads.find((l) => l.email.toLowerCase() === email.toLowerCase());
  if (!lead) return;
  // Marquer j1 ET j3 comme envoyés → le cron les skip
  await markSent(lead.email, "j1");
  await markSent(lead.email, "j3");
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const ok = await verifyShopifyHmac(raw, hmac);
  if (!ok) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(raw) as ShopifyOrder;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const capi = await sendPurchaseToMeta(order);
  const customerEmail = order.customer?.email ?? order.email ?? "";
  if (customerEmail) {
    try { await clearLeadForEmail(customerEmail); } catch (err) {
      console.warn("[shopify-webhook] clearLead failed", err);
    }
  }

  // Notification admin "commande reçue" — envoyée à ADMIN_NOTIFY_EMAIL
  // (fallback : hypermap.pro@gmail.com). Best-effort, on n'échoue jamais
  // sur ça — l'important c'est que Shopify reçoive un 200 pour ne pas
  // retry en boucle.
  try {
    await notifyAdmin(order);
  } catch (err) {
    console.warn("[shopify-webhook] admin notify failed", err);
  }

  return NextResponse.json({ ok: true, capi: capi.ok, order_id: order.id });
}

async function notifyAdmin(order: ShopifyOrder): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL ?? "hypermap.pro@gmail.com";
  const items = (order.line_items ?? [])
    .map((li) => `• ${li.quantity ?? 1}× (variant ${li.variant_id ?? "?"}) — ${li.price ?? "?"}€`)
    .join("<br>");
  const custName = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") || "Client";
  const html = `
    <h2 style="margin:0 0 12px 0;font-size:20px;">🛒 Nouvelle commande #${order.order_number ?? order.id}</h2>
    <p><strong>${custName}</strong> · ${order.customer?.email ?? order.email ?? "(sans email)"}</p>
    <p><strong>Montant : ${order.total_price ?? "?"} ${order.currency ?? "EUR"}</strong></p>
    <p style="margin-top:16px;"><strong>Articles :</strong><br>${items || "—"}</p>
    <p style="margin-top:20px;">
      <a href="https://admin.shopify.com/store/y823wg-nz/orders/${order.id}"
         style="display:inline-block;padding:12px 24px;background:#0e1013;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;">
        Voir dans Shopify Admin →
      </a>
    </p>
  `;
  await sendEmail({
    to,
    subject: `🛒 Nouvelle commande #${order.order_number ?? order.id} — ${order.total_price ?? "?"}€`,
    htmlContent: html,
    tags: ["order-notification"],
  });
}
