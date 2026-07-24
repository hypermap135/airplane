/**
 * POST /api/admin/approve
 *
 * Body: { handle: string, previewSlug?: string }
 *
 * Promotes .tmp/preview/{previewSlug ?? handle}.png to
 * public/images/{handle}.webp (the canonical product image) so the live
 * card uses the new photo on next deploy.
 *
 * Logs the handle to .tmp/approved.json — the batch deploy endpoint then
 * uses that list to rewrite products.ts and trigger Vercel.
 *
 * Multi-view gallery (profile / 3quarter-front / etc.):
 *   - The view's preview lives at .tmp/preview/{handle}--{view}.png
 *   - When the operator validates a non-profile view, it overwrites the
 *     canonical {handle}.png so it becomes the product's main image.
 *     (Future iteration: also append to a gallery JSON for multi-image
 *     product pages.)
 *
 * Local dev only.
 */

import { NextRequest, NextResponse } from "next/server";
import { copyFile, mkdir, readFile, writeFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const APPROVED_LOG = path.join(process.cwd(), ".tmp", "approved.json");

async function appendApproved(handle: string) {
  let current: string[] = [];
  try {
    const txt = await readFile(APPROVED_LOG, "utf-8");
    current = JSON.parse(txt);
  } catch {
    current = [];
  }
  if (!current.includes(handle)) current.push(handle);
  await writeFile(APPROVED_LOG, JSON.stringify(current, null, 2));
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const { handle, previewSlug } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  // previewSlug may include "--{view}" — sanitize the same way.
  const slug = (previewSlug && /^[a-z0-9-]+$/i.test(previewSlug)) ? previewSlug : handle;

  const src = path.join(process.cwd(), ".tmp", "preview", `${slug}.png`);
  const destDir = path.join(process.cwd(), "public", "images");
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, `${handle}.png`);

  try {
    await stat(src);
  } catch {
    return NextResponse.json(
      { error: `preview not found for ${slug}. Process it first.` },
      { status: 404 },
    );
  }

  await copyFile(src, dest);
  await appendApproved(handle);

  return NextResponse.json({
    ok: true,
    publicPath: `/images/${handle}.webp`,
    sourceSlug: slug,
  });
}
