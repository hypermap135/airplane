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
import { writeFile, mkdir, readdir, unlink, stat, copyFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const REF_DIR = path.join(process.cwd(), ".tmp", "references");
const PREVIEW_DIR = path.join(process.cwd(), ".tmp", "preview");

/**
 * POST has two modes:
 *
 *  • multipart/form-data with `file` + `handle` → upload a fresh ref photo
 *  • application/json     with `{handle, promoteFromPreview: true}` →
 *    copy the currently-generated base preview (.tmp/preview/{handle}.png)
 *    into the references slot so it becomes the design guide for the next
 *    angle generation. This is how the operator "keeps" a generated image
 *    they're happy with as the canonical reference.
 */
export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Photos studio is local-only. Run `npm run dev`." },
      { status: 501 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";

  // ── JSON mode: promote an existing preview to reference ────────────────
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const handle = (body?.handle as string | undefined)?.trim();
    if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
      return NextResponse.json({ error: "invalid handle" }, { status: 400 });
    }
    if (!body?.promoteFromPreview) {
      return NextResponse.json(
        { error: "missing 'promoteFromPreview: true'" },
        { status: 400 },
      );
    }

    const src = path.join(PREVIEW_DIR, `${handle}.png`);
    try {
      await stat(src);
    } catch {
      return NextResponse.json(
        { error: `no preview at ${src} — generate the base model first` },
        { status: 404 },
      );
    }

    await mkdir(REF_DIR, { recursive: true });
    // wipe any previous ref for this handle (any extension)
    try {
      for (const f of await readdir(REF_DIR)) {
        if (f.startsWith(`${handle}.`)) {
          await unlink(path.join(REF_DIR, f));
        }
      }
    } catch {/* fine */}

    const dest = path.join(REF_DIR, `${handle}.png`);
    await copyFile(src, dest);
    const s = await stat(dest);
    return NextResponse.json({
      ok: true,
      path: dest,
      size_kb: Math.round(s.size / 1024),
      promoted: true,
    });
  }

  // ── multipart mode: classic file upload ────────────────────────────────
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

/**
 * DELETE /api/admin/reference?handle=…
 *
 * Wipes the reference photo for a product so subsequent regenerations
 * fall back to the source-only prompt. Used when the operator wants to
 * start over.
 */
export async function DELETE(req: NextRequest) {
  if (process.env.VERCEL) return NextResponse.json({ ok: true });
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }
  try {
    for (const f of await readdir(REF_DIR)) {
      if (f.startsWith(`${handle}.`)) {
        await unlink(path.join(REF_DIR, f));
      }
    }
  } catch {/* fine */}
  return NextResponse.json({ ok: true });
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
