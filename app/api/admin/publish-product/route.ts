/**
 * POST /api/admin/publish-product
 *   Body: {
 *     handle: string,
 *     views: string[]    // approved view keys in display order (first → cover)
 *   }
 *
 * Publishes ONE product:
 *   1. Copies each .tmp/preview/{handle}--{view}.png (or {handle}.png for
 *      "profile") to public/images/, named {handle}.png for the cover view
 *      and {handle}--{view}.png for the gallery views.
 *   2. Rewrites the product entry in lib/products.ts:
 *        - image: `/images/{handle}.png`
 *        - images: ["/images/{handle}.png", "/images/{handle}--{view}.png", ...]
 *   3. Stages + commits + triggers `vercel --prod --yes`.
 *
 * Local dev only.
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, copyFile, mkdir, stat } from "fs/promises";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 300;

const PRODUCTS_TS = path.join(process.cwd(), "lib", "products.ts");
const PREVIEW_DIR = path.join(process.cwd(), ".tmp", "preview");
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

function previewFile(handle: string, view: string): string {
  const slug = view === "profile" ? handle : `${handle}--${view}`;
  return path.join(PREVIEW_DIR, `${slug}.png`);
}

function publicFile(handle: string, view: string): string {
  const slug = view === "profile" ? handle : `${handle}--${view}`;
  return path.join(IMAGES_DIR, `${slug}.png`);
}

function publicUrl(handle: string, view: string): string {
  const slug = view === "profile" ? handle : `${handle}--${view}`;
  return `/images/${slug}.png`;
}

/**
 * Rewrite the product entry in lib/products.ts:
 *   - image:  `/images/{handle}.png`
 *   - images: [<the gallery>]
 */
async function rewriteProduct(
  handle: string,
  coverUrl: string,
  galleryUrls: string[],
): Promise<{ ok: boolean; reason?: string }> {
  const source = await readFile(PRODUCTS_TS, "utf-8");

  // Find the product block by handle. We're conservative — only the
  // single product whose handle string matches gets touched.
  const handleEscaped = handle.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");

  // Rewrite image: line (first occurrence within the matching block).
  const imageRe = new RegExp(
    `(handle:\\s*"${handleEscaped}",[\\s\\S]*?image:\\s*)(\`[^\`]+\`|"[^"]+")`,
    "m",
  );
  let next = source;
  if (imageRe.test(next)) {
    next = next.replace(imageRe, `$1\`${coverUrl}\``);
  } else {
    return { ok: false, reason: `no image: line found for handle "${handle}"` };
  }

  // Rewrite (or add) the images: [...] array. Match the same block.
  const imagesRe = new RegExp(
    `(handle:\\s*"${handleEscaped}",[\\s\\S]*?)(images:\\s*\\[[\\s\\S]*?\\],?)`,
    "m",
  );
  const galleryLines = galleryUrls.map((u) => `      \`${u}\`,`).join("\n");
  const newImagesBlock = `images: [\n${galleryLines}\n    ],`;

  if (imagesRe.test(next)) {
    next = next.replace(imagesRe, `$1${newImagesBlock}`);
  } else {
    // No images: field today — inject right after the image: line.
    const insertRe = new RegExp(
      `(handle:\\s*"${handleEscaped}",[\\s\\S]*?image:\\s*\`[^\`]+\`,?)`,
      "m",
    );
    next = next.replace(insertRe, `$1\n    ${newImagesBlock}`);
  }

  if (next === source) {
    return { ok: false, reason: "no changes (regex matched but rewrite was a no-op)" };
  }
  await writeFile(PRODUCTS_TS, next);
  return { ok: true };
}

function runCmd(
  cmd: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Publish is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const { handle, views, deploy = true } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }
  if (!Array.isArray(views) || views.length === 0) {
    return NextResponse.json(
      { error: "views[] required (validated view keys, first = cover)" },
      { status: 400 },
    );
  }

  // Verify every preview exists before touching anything
  const missing: string[] = [];
  for (const v of views) {
    try {
      await stat(previewFile(handle, v));
    } catch {
      missing.push(v);
    }
  }
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `previews missing for: ${missing.join(", ")}` },
      { status: 404 },
    );
  }

  await mkdir(IMAGES_DIR, { recursive: true });

  // Cover = the first view in the array. Always copied to {handle}.png
  // (overwrites whatever was there).
  const coverView = views[0];
  await copyFile(previewFile(handle, coverView), publicFile(handle, "profile"));

  // The rest go to {handle}--{view}.png
  for (const v of views.slice(1)) {
    await copyFile(previewFile(handle, v), publicFile(handle, v));
  }

  const coverUrl = publicUrl(handle, "profile");
  const galleryUrls = [
    coverUrl,
    ...views.slice(1).map((v) => publicUrl(handle, v)),
  ];

  const rewriteResult = await rewriteProduct(handle, coverUrl, galleryUrls);
  if (!rewriteResult.ok) {
    return NextResponse.json(
      { error: `products.ts rewrite failed: ${rewriteResult.reason}` },
      { status: 500 },
    );
  }

  if (!deploy) {
    return NextResponse.json({
      ok: true,
      handle,
      coverUrl,
      gallery: galleryUrls,
      deployed: false,
    });
  }

  // Stage only the files we touched (don't accidentally commit unrelated
  // dirty state in the working tree).
  const stagedFiles = [
    "lib/products.ts",
    publicFile(handle, "profile").replace(`${process.cwd()}/`, ""),
    ...views.slice(1).map((v) =>
      publicFile(handle, v).replace(`${process.cwd()}/`, ""),
    ),
  ];
  const addRes = await runCmd("git", ["add", ...stagedFiles]);
  if (addRes.code !== 0) {
    return NextResponse.json(
      { error: `git add: ${addRes.stderr}` },
      { status: 500 },
    );
  }

  const commitMsg = `feat(images): publish ${handle} — ${views.length} view${views.length > 1 ? "s" : ""} from /admin/photos`;
  const commitRes = await runCmd("git", ["commit", "-m", commitMsg]);
  // Tolerate "nothing to commit" (e.g. byte-identical PNGs after re-process)
  if (
    commitRes.code !== 0 &&
    !commitRes.stdout.includes("nothing to commit")
  ) {
    return NextResponse.json(
      { error: `git commit: ${commitRes.stderr || commitRes.stdout}` },
      { status: 500 },
    );
  }

  const deployRes = await runCmd("npx", ["vercel", "--prod", "--yes"]);
  const deployUrl =
    (deployRes.stdout.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? []).pop() ??
    null;

  return NextResponse.json({
    ok: true,
    handle,
    coverUrl,
    gallery: galleryUrls,
    deployed: true,
    deployUrl,
  });
}
