import { NextResponse } from "next/server";

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
 * Returns { url } pointing to the uploaded image in Vercel Blob.
 *
 * Used by the admin product editor when the shopkeeper drops a new photo
 * onto a product. The returned URL is then written to the override store
 * via PATCH /api/admin/products/[id].
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

  const ext = mime.split("/")[1] ?? "bin";
  const rawName =
    file instanceof File && file.name ? file.name : `upload.${ext}`;
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const stamp = Math.floor(Math.random() * 1e9).toString(36);
  const pathname = `${folder}/${stamp}-${safeName}`;

  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, file, {
      access: "public",
      contentType: mime,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("[admin/upload] put failed:", err);
    return NextResponse.json(
      { error: "blob_put_failed", detail: String(err) },
      { status: 500 },
    );
  }
}
