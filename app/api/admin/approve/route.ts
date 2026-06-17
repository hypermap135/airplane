/**
 * POST /api/admin/approve
 *
 * Body: { handle: string }
 *
 * Promotes .tmp/preview/{handle}.png to public/images/{handle}.png so
 * the product card on the live site uses the new photo on next deploy.
 *
 * Also dumps a JSON file `.tmp/approved.json` listing every approved
 * handle in this session — the dev (Claude or human) reads it when
 * batching commits + a single Vercel deploy at the end.
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

  const { handle } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  const src = path.join(process.cwd(), ".tmp", "preview", `${handle}.png`);
  const destDir = path.join(process.cwd(), "public", "images");
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, `${handle}.png`);

  try {
    await stat(src);
  } catch {
    return NextResponse.json(
      { error: `preview not found for ${handle}. Process it first.` },
      { status: 404 },
    );
  }

  await copyFile(src, dest);
  await appendApproved(handle);

  return NextResponse.json({
    ok: true,
    publicPath: `/images/${handle}.png`,
    message:
      "Image promoted to public/images/. " +
      "Don't forget to update lib/products.ts and deploy.",
  });
}
