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
import { readdir, mkdir, stat } from "fs/promises";
import path from "path";

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

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const { handle, sourcePath } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }

  // Prefer an explicit sourcePath (from the folder-scan flow). Fall back
  // to the upload flow only when no path is given.
  let source: string | null = null;
  if (sourcePath && typeof sourcePath === "string") {
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
      { error: `no source for ${handle}. Pick a file from the folder or upload one.` },
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
