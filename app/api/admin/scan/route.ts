/**
 * POST /api/admin/scan
 *
 * Body: { folder: string }   (absolute path to a folder on the operator's Mac)
 *
 * Walks the folder, picks every image file (png/jpg/webp/heic), and
 * returns a list `{ filename, path }`. The client then assigns each
 * source to a product via a dropdown — no upload, the file stays on disk.
 *
 * Local dev only — Vercel can't read arbitrary FS paths.
 */

import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";
import os from "os";

export const runtime = "nodejs";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".heic"]);

/** Expand a leading ~ to the user's home dir. */
function expandHome(p: string): string {
  if (!p) return "";
  if (p === "~" || p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const { folder } = await req.json();
  if (!folder || typeof folder !== "string") {
    return NextResponse.json({ error: "folder required" }, { status: 400 });
  }

  const abs = path.resolve(expandHome(folder.trim()));
  try {
    const s = await stat(abs);
    if (!s.isDirectory()) {
      return NextResponse.json({ error: `${abs} is not a folder` }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: `Folder not found: ${abs}` }, { status: 404 });
  }

  const entries = await readdir(abs, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
    .sort();

  return NextResponse.json({
    folder: abs,
    count: files.length,
    files: files.map((name) => ({ name, path: path.join(abs, name) })),
  });
}
