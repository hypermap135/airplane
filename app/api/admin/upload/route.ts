import { NextResponse } from "next/server";
import { uploadFileToRepo, isGitHubStorageConfigured } from "@/lib/github-storage";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * POST /api/admin/upload
 *   multipart/form-data with `file` field, optional `folder` field.
 * Returns { url } pointing to the uploaded image, served from the Vercel
 * deployment (via /public/images/uploads/…).
 *
 * Used by the admin product editor when the shopkeeper drops a new photo
 * onto a product. Photos are committed to the repo → auto-deployed by
 * Vercel → served as static assets. Same GitHub-storage strategy as the
 * JSON overrides, keeping everything free (no Vercel Blob dependency).
 *
 * The image is only visible ~1-2 minutes after upload (time for the
 * Vercel deploy triggered by the commit). Reasonable trade-off vs paying
 * $20/mo for Vercel Pro to lift the Blob quota.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  const file = form.get("file");
  const folder = (form.get("folder") as string | null) ?? "products";

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", limit: MAX_BYTES },
      { status: 413 },
    );
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      { error: "unsupported_mime", got: mime },
      { status: 415 },
    );
  }

  if (!isGitHubStorageConfigured()) {
    return NextResponse.json(
      {
        error: "storage_not_configured",
        userMessage:
          "Upload photos indisponible : configure GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO sur Vercel.",
      },
      { status: 503 },
    );
  }

  const ext = mime.split("/")[1] ?? "bin";
  const rawName =
    file instanceof File && file.name ? file.name : `upload.${ext}`;
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const stamp = Math.floor(Math.random() * 1e9).toString(36);
  // Path in the repo: public/images/uploads/{folder}/{stamp}-{safeName}
  // Public URL: /images/uploads/{folder}/{stamp}-{safeName}
  const repoPath = `public/images/uploads/${folder}/${stamp}-${safeName}`;
  const publicUrl = `/images/uploads/${folder}/${stamp}-${safeName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFileToRepo(
      repoPath,
      buffer,
      `admin: upload ${safeName} (${folder})`,
    );
    return NextResponse.json({ url: publicUrl, pathname: publicUrl });
  } catch (err) {
    console.error("[admin/upload] github upload failed:", err);
    return NextResponse.json(
      { error: "upload_failed", detail: String(err).slice(0, 300) },
      { status: 500 },
    );
  }
}
