/**
 * POST /api/admin/reference
 *   multipart/form-data with `file` and `handle` fields.
 *
 * Saves the operator's "design reference" photo (e.g. a real airline photo
 * found online) to .tmp/references/{handle}.{ext} so the next /process
 * call can pass it to Gemini as a second image and ask it to imitate
 * that reference's livery on the existing maquette.
 *
 * Distinct from /api/admin/upload (which was repurposed for Vercel Blob
 * by another agent) — this route stays local-disk + project-specific so
 * the photos studio workflow keeps working independently.
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, unlink, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const REF_DIR = path.join(process.cwd(), ".tmp", "references");

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Photos studio is local-only. Run `npm run dev`." },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const handle = (form.get("handle") as string | null)?.trim();

  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  const rawName = file instanceof File && file.name ? file.name : "ref.png";
  const ext = (rawName.split(".").pop() || "png").toLowerCase();
  const safeExt = ["png", "jpg", "jpeg", "webp", "heic"].includes(ext) ? ext : "png";

  await mkdir(REF_DIR, { recursive: true });

  // Wipe any previous reference for this handle (different extension)
  try {
    for (const f of await readdir(REF_DIR)) {
      if (f.startsWith(`${handle}.`)) {
        await unlink(path.join(REF_DIR, f));
      }
    }
  } catch {
    /* dir didn't exist — fine */
  }

  const dest = path.join(REF_DIR, `${handle}.${safeExt}`);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buf);

  return NextResponse.json({
    ok: true,
    path: dest,
    size_kb: Math.round(buf.length / 1024),
  });
}

/** GET — check whether a reference exists for a handle. */
export async function GET(req: NextRequest) {
  if (process.env.VERCEL) return NextResponse.json({ exists: false });
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ exists: false });
  }
  try {
    const files = await readdir(REF_DIR);
    const match = files.find((f) => f.startsWith(`${handle}.`));
    if (!match) return NextResponse.json({ exists: false });
    const full = path.join(REF_DIR, match);
    const s = await stat(full);
    return NextResponse.json({
      exists: true,
      path: full,
      size_kb: Math.round(s.size / 1024),
    });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
