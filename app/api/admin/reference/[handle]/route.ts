/**
 * GET /api/admin/reference/{handle}
 *
 * Streams the reference photo stored at .tmp/references/{handle}.* so the
 * admin UI can display it in the "🎯 RÉFÉRENCE" pane. Picks any matching
 * extension (png/jpg/webp/heic). Local dev only.
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const REF_DIR = path.join(process.cwd(), ".tmp", "references");

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  heic: "image/heic",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { handle: string } },
) {
  if (process.env.VERCEL) {
    return new NextResponse("Admin local-only", { status: 501 });
  }

  const { handle } = params;
  if (!/^[a-z0-9-]+$/i.test(handle)) {
    return new NextResponse("invalid handle", { status: 400 });
  }

  let files: string[];
  try {
    files = await readdir(REF_DIR);
  } catch {
    return new NextResponse("no reference dir", { status: 404 });
  }

  const match = files.find((f) => f.startsWith(`${handle}.`));
  if (!match) return new NextResponse("no reference", { status: 404 });

  const full = path.join(REF_DIR, match);
  try {
    await stat(full);
    const buf = await readFile(full);
    const ext = (match.split(".").pop() || "png").toLowerCase();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": MIME[ext] ?? "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("read failed", { status: 500 });
  }
}
