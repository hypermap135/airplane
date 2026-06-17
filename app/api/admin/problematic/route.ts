/**
 * POST /api/admin/problematic
 *   Body: { handle: string, reason?: string, remove?: boolean }
 *   Marks (or unmarks with `remove: true`) a product whose current image
 *   is unusable — the operator will re-request a fresh photo from the
 *   client. Persists to .tmp/photos-to-request.json.
 *
 * GET /api/admin/problematic
 *   Returns the current list as { items: Array<{ handle, title, reason?, ts }> }.
 *
 * Local dev only — relies on disk writes.
 */

import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { PRODUCTS } from "@/lib/products";

export const runtime = "nodejs";

const STORE = path.join(process.cwd(), ".tmp", "photos-to-request.json");

type Item = { handle: string; title: string; reason?: string; ts: number };

async function readStore(): Promise<Item[]> {
  try {
    return JSON.parse(await readFile(STORE, "utf-8"));
  } catch {
    return [];
  }
}

async function writeStore(items: Item[]): Promise<void> {
  await mkdir(path.dirname(STORE), { recursive: true });
  await writeFile(STORE, JSON.stringify(items, null, 2));
}

function vercelGuard() {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }
  return null;
}

export async function GET() {
  const guard = vercelGuard();
  if (guard) return guard;
  const items = await readStore();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const guard = vercelGuard();
  if (guard) return guard;

  const { handle, reason, remove } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  const product = PRODUCTS.find((p) => p.handle === handle);
  if (!product) {
    return NextResponse.json({ error: `product ${handle} not found` }, { status: 404 });
  }

  let items = await readStore();
  if (remove) {
    items = items.filter((it) => it.handle !== handle);
  } else {
    items = items.filter((it) => it.handle !== handle);
    items.push({
      handle,
      title: product.title,
      reason: reason || undefined,
      ts: Date.now(),
    });
  }
  await writeStore(items);

  return NextResponse.json({ ok: true, count: items.length, items });
}
