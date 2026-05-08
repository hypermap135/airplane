/**
 * Meta Conversions API endpoint.
 * Receives events from the client (via lib/meta.ts trackMeta) and forwards
 * them to Meta's Graph API for server-side tracking.
 *
 * Events sent here are deduped against the browser Pixel via the same
 * event_id, giving iOS-resistant + ad-blocker-resistant tracking.
 *
 * Required env vars:
 *   META_PIXEL_ID        — same as NEXT_PUBLIC_META_PIXEL_ID
 *   META_CAPI_TOKEN      — Conversions API access token (long string)
 *   META_TEST_EVENT_CODE — (optional) for QA via Test Events tab
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "edge";

const PIXEL_ID = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN ?? "";
const TEST_CODE = process.env.META_TEST_EVENT_CODE ?? "";
const API_VERSION = "v21.0";

type ClientPayload = {
  event_name: string;
  event_id: string;
  event_source_url: string;
  params: Record<string, unknown>;
  utm?: Record<string, string>;
};

function sha256(s: string): string {
  // edge runtime: use Web Crypto via node:crypto polyfill
  return crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    // No credentials → silently 204 so client doesn't error
    return new NextResponse(null, { status: 204 });
  }

  let body: ClientPayload;
  try {
    body = (await req.json()) as ClientPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Extract user_data from request headers
  const ua = req.headers.get("user-agent") ?? "";
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0].trim() || req.headers.get("x-real-ip") || "";

  // _fbp / _fbc cookies (if Pixel is loaded, it sets these)
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    if (k && v) cookies[k] = decodeURIComponent(v);
  });

  const userData: Record<string, unknown> = {
    client_user_agent: ua,
    client_ip_address: ip,
  };
  if (cookies.fbp) userData.fbp = cookies.fbp;
  if (cookies.fbc) userData.fbc = cookies.fbc;

  // Custom data: merge passed params + UTM source/medium/campaign
  const customData: Record<string, unknown> = { ...body.params };
  if (body.utm) {
    if (body.utm.utm_source) customData.utm_source = body.utm.utm_source;
    if (body.utm.utm_medium) customData.utm_medium = body.utm.utm_medium;
    if (body.utm.utm_campaign) customData.utm_campaign = body.utm.utm_campaign;
  }

  const event = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    event_source_url: body.event_source_url,
    action_source: "website",
    user_data: userData,
    custom_data: customData,
  };

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.warn("[meta-capi] non-200:", res.status, data);
      return NextResponse.json({ ok: false, status: res.status, data }, { status: 200 });
    }
    return NextResponse.json({ ok: true, events_received: data.events_received ?? 0 });
  } catch (err) {
    console.warn("[meta-capi] fetch failed:", err);
    return NextResponse.json({ ok: false, error: "upstream failed" }, { status: 200 });
  }
}

// Silence unused crypto warning in edge runtime
void sha256;
