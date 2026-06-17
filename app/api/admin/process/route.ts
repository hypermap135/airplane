/**
 * POST /api/admin/process
 *
 * Body: { handle: string }
 *
 * Looks for an uploaded source under .tmp/uploads/{handle}.* and runs
 * scripts/enhance_product_photo.py against it, writing the framed PNG
 * to .tmp/preview/{handle}.png. Returns the relative URL so the UI can
 * preview the result.
 *
 * Local dev only — Vercel doesn't ship Python.
 */

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { readdir, mkdir, stat, writeFile, copyFile } from "fs/promises";
import path from "path";
import { PRODUCTS } from "@/lib/products";

export const runtime = "nodejs";
export const maxDuration = 180; // Gemini round-trip can take 30-90s

async function findUpload(handle: string): Promise<string | null> {
  const dir = path.join(process.cwd(), ".tmp", "uploads");
  try {
    const files = await readdir(dir);
    const match = files.find((f) => f.startsWith(`${handle}.`));
    return match ? path.join(dir, match) : null;
  } catch {
    return null;
  }
}

/**
 * Pull the product's CURRENT image (either CDN Shopify URL or a local
 * /public/ path) into .tmp/current/{handle}.ext so the Python pipeline
 * can read it as a regular local file. Returns either the local path or
 * a string starting with "error: ..." for the caller to surface.
 */
async function stageCurrentImage(handle: string): Promise<string> {
  const product = PRODUCTS.find((p) => p.handle === handle);
  if (!product) return `error: product ${handle} not found`;

  const img = product.image;
  const ext = (img.split(".").pop() || "png").toLowerCase().split("?")[0];
  const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";

  const tmpDir = path.join(process.cwd(), ".tmp", "current");
  try {
    await mkdir(tmpDir, { recursive: true });
  } catch (e) {
    return `error: mkdir failed (${(e as Error).message})`;
  }
  const dest = path.join(tmpDir, `${handle}.${safeExt}`);

  if (img.startsWith("http")) {
    try {
      // Some CDNs (Shopify included) return 403 to fetches without UA
      const res = await fetch(img, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AirplaneStoreAdmin/1.0",
        },
      });
      if (!res.ok) return `error: ${img} → HTTP ${res.status}`;
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
    } catch (e) {
      return `error: fetch failed (${(e as Error).message}) for ${img}`;
    }
  } else if (img.startsWith("/")) {
    const src = path.join(process.cwd(), "public", img.replace(/^\//, ""));
    try {
      await copyFile(src, dest);
    } catch (e) {
      return `error: local copy failed (${(e as Error).message}) for ${src}`;
    }
  } else {
    return `error: unsupported image URL format "${img}"`;
  }
  return dest;
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const { handle, sourcePath, useCurrent } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  // Source resolution priority:
  //   1. useCurrent: true  →  pull the product's current image
  //                           (Shopify CDN URL or local public/ file)
  //   2. sourcePath given  →  use that file directly
  //   3. otherwise         →  fall back to legacy .tmp/uploads/{handle}.*
  let source: string | null = null;
  if (useCurrent) {
    const staged = await stageCurrentImage(handle);
    if (staged.startsWith("error:")) {
      return NextResponse.json({ error: staged }, { status: 502 });
    }
    source = staged;
  } else if (sourcePath && typeof sourcePath === "string") {
    try {
      const s = await stat(sourcePath);
      if (s.isFile()) source = sourcePath;
    } catch {
      return NextResponse.json(
        { error: `sourcePath not readable: ${sourcePath}` },
        { status: 404 },
      );
    }
  } else {
    source = await findUpload(handle);
  }
  if (!source) {
    return NextResponse.json(
      { error: `no source for ${handle}. Use 'Améliorer photo actuelle' or pick a file.` },
      { status: 404 },
    );
  }

  const previewDir = path.join(process.cwd(), ".tmp", "preview");
  await mkdir(previewDir, { recursive: true });
  const dest = path.join(previewDir, `${handle}.png`);

  // Spawn the Python pipeline. Capture stdout/stderr for debugging.
  const script = path.join(process.cwd(), "scripts", "enhance_product_photo.py");
  return new Promise<NextResponse>((resolve) => {
    const proc = spawn("python3", [script, source, dest], {
      cwd: process.cwd(),
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", async (code) => {
      if (code !== 0) {
        resolve(
          NextResponse.json(
            { error: `pipeline failed (code ${code})`, stdout, stderr },
            { status: 500 },
          ),
        );
        return;
      }
      try {
        const s = await stat(dest);
        // The Next dev server serves .tmp files only via custom routing,
        // so we return a separate /api/admin/preview/{handle} URL that
        // streams the file. See app/api/admin/preview/[handle]/route.ts.
        resolve(
          NextResponse.json({
            ok: true,
            previewUrl: `/api/admin/preview/${handle}?t=${Date.now()}`,
            size_kb: Math.round(s.size / 1024),
            log: stdout.trim(),
          }),
        );
      } catch (e) {
        resolve(
          NextResponse.json(
            { error: `pipeline ran but output missing: ${e}` },
            { status: 500 },
          ),
        );
      }
    });
  });
}
