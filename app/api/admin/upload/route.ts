/**
 * POST /api/admin/upload
 *
 * Receives one source image (multipart/form-data) from the admin photo
 * picker UI and saves it under .tmp/uploads/{handle}.{ext} so the next
 * pipeline call can find it. Local dev only — Vercel's serverless
 * filesystem is read-only, so this route returns 501 in production.
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const handle = (form.get("handle") as string | null)?.trim();

  if (!file || !handle) {
    return NextResponse.json({ error: "file + handle required" }, { status: 400 });
  }

  // Sanitize handle (only letters / digits / dash)
  if (!/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const safeExt = ["png", "jpg", "jpeg", "webp", "heic"].includes(ext) ? ext : "png";

  const uploadsDir = path.join(process.cwd(), ".tmp", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const dest = path.join(uploadsDir, `${handle}.${safeExt}`);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, bytes);

  return NextResponse.json({
    ok: true,
    path: dest.replace(process.cwd(), ""),
    size_kb: Math.round(bytes.length / 1024),
  });
}
