import { NextResponse } from "next/server";
import { getSiteContent, writeSiteContent, type SiteContent } from "@/lib/site-content";

export const runtime = "nodejs";

/**
 * GET  /api/admin/content — retourne le contenu actuel (avec surcharges GitHub)
 * PATCH /api/admin/content — remplace la section indiquée (hero / corporate / faq)
 *   body: { section: "hero" | "corporate" | "faq", data: ... }
 */

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    section?: keyof SiteContent;
    data?: unknown;
  } | null;
  if (!body || !body.section || body.data === undefined) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!["hero", "corporate", "faq"].includes(body.section)) {
    return NextResponse.json({ error: "invalid_section" }, { status: 400 });
  }

  const current = await getSiteContent();
  const next: SiteContent = { ...current, [body.section]: body.data } as SiteContent;

  try {
    await writeSiteContent(next);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "write_failed", detail: String(err).slice(0, 300) },
      { status: 500 },
    );
  }
}
