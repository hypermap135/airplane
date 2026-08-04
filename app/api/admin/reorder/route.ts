import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { readOverrides, writeOverrides, type OverridesMap, type ProductOverride } from "@/lib/products-store";

export const runtime = "nodejs";

/**
 * POST /api/admin/reorder
 *   body: { productIds: string[] }
 *
 * Assigne sortOrder (0, 10, 20, 30…) à chaque productId dans l'ordre reçu.
 * Une seule écriture GitHub pour tout le batch → rapide.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { productIds?: string[] } | null;
  if (!body?.productIds || !Array.isArray(body.productIds)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const known = new Set(PRODUCTS.map((p) => p.id));
  const ids = body.productIds.filter((id) => known.has(id));
  if (ids.length === 0) {
    return NextResponse.json({ error: "no_valid_ids" }, { status: 400 });
  }

  const current = await readOverrides();
  const next: OverridesMap = { ...current };
  ids.forEach((id, i) => {
    const prev: ProductOverride = next[id] ?? {};
    next[id] = { ...prev, sortOrder: i * 10 };
  });

  try {
    await writeOverrides(next);
    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    return NextResponse.json(
      { error: "write_failed", detail: String(err).slice(0, 300) },
      { status: 500 },
    );
  }
}
