import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  getInventorySnapshot,
  INVENTORY_ADMIN_TAG,
} from "@/lib/shopify-admin-inventory";

/**
 * Live inventory snapshot for the admin UI.
 *
 * GET  /api/admin/inventory       — returns the cached snapshot (60 s TTL).
 * POST /api/admin/inventory?force=1 — busts the cache and re-fetches.
 *
 * Admin-gated by middleware; no manual auth needed here.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getInventorySnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: String((err as Error)?.message ?? err) },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    revalidateTag(INVENTORY_ADMIN_TAG);
    const snapshot = await getInventorySnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: String((err as Error)?.message ?? err) },
      { status: 500 },
    );
  }
}
