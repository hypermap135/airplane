/**
 * GET /api/admin/preview-status
 *
 * Walks .tmp/preview/ once and returns the full map of products that
 * already have at least one preview on disk:
 *
 *   { handles: { "<handle>": ["profile", "3quarter-front", ...], ... } }
 *
 * The /admin/photos page calls this on mount to hydrate the React state
 * — without it, refreshing the page wipes the local "which previews are
 * generated" memory and the ✅ Valider button disappears even though the
 * preview is still served by /api/admin/preview/<slug>.
 *
 * Local dev only.
 */

import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const PREVIEW_DIR = path.join(process.cwd(), ".tmp", "preview");

const VIEW_KEYS = [
  "profile",
  "3quarter-front",
  "3quarter-rear",
  "top",
  "shelf",
  "desk",
];

export async function GET() {
  if (process.env.VERCEL) {
    return NextResponse.json({ handles: {} });
  }

  let files: string[] = [];
  try {
    files = await readdir(PREVIEW_DIR);
  } catch {
    return NextResponse.json({ handles: {} });
  }

  // Group by handle. Filenames look like:
  //   "<handle>.png"             → profile view
  //   "<handle>--3quarter-front.png" → that view
  const handles: Record<string, string[]> = {};
  for (const f of files) {
    if (!f.endsWith(".png")) continue;
    const base = f.slice(0, -4); // strip ".png"
    const sepIdx = base.lastIndexOf("--");
    let handle: string;
    let view: string;
    if (sepIdx >= 0) {
      handle = base.slice(0, sepIdx);
      view = base.slice(sepIdx + 2);
      if (!VIEW_KEYS.includes(view)) continue;
    } else {
      handle = base;
      view = "profile";
    }
    if (!handles[handle]) handles[handle] = [];
    if (!handles[handle].includes(view)) handles[handle].push(view);
  }

  return NextResponse.json({ handles });
}
