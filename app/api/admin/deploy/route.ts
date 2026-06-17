/**
 * POST /api/admin/deploy
 *
 * Reads .tmp/approved.json (list of handles whose new photos have been
 * promoted to public/images/), updates lib/products.ts so each product's
 * `image:` (and the first entry of `images:`) points to /images/{handle}.png,
 * commits the change, and triggers a Vercel production deploy.
 *
 * Local dev only — needs the local git + vercel CLI.
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, stat } from "fs/promises";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 300; // vercel deploy can take a couple minutes

const APPROVED_LOG = path.join(process.cwd(), ".tmp", "approved.json");
const PRODUCTS_TS = path.join(process.cwd(), "lib", "products.ts");

async function readApproved(): Promise<string[]> {
  try {
    return JSON.parse(await readFile(APPROVED_LOG, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * For each handle, rewrite the first `image: ...` line within the matching
 * product block to /images/{handle}.png. Conservative regex: only the
 * first image line per product block is rewritten so we don't touch the
 * `images: [ ... ]` gallery array (operator can curate that manually if
 * they want to keep the older photos as additional gallery shots).
 */
async function rewriteProductsTs(handles: string[]): Promise<{ updated: string[]; missing: string[] }> {
  const original = await readFile(PRODUCTS_TS, "utf-8");
  let next = original;
  const updated: string[] = [];
  const missing: string[] = [];

  for (const h of handles) {
    // Match: handle: "h", ... image: `...`,   (allowing template-literal or string)
    // We anchor on the handle and look ahead for the first image: line.
    const re = new RegExp(
      `(handle:\\s*"${h.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}",[\\s\\S]*?image:\\s*)(\`[^\`]+\`|"[^"]+")`,
      "m",
    );
    if (re.test(next)) {
      next = next.replace(re, `$1\`/images/${h}.png\``);
      updated.push(h);
    } else {
      missing.push(h);
    }
  }

  if (updated.length > 0) await writeFile(PRODUCTS_TS, next);
  return { updated, missing };
}

function runCmd(cmd: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

export async function POST(_req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Admin pipeline is local-only. Run `npm run dev` on your Mac." },
      { status: 501 },
    );
  }

  const approved = await readApproved();
  if (approved.length === 0) {
    return NextResponse.json(
      { error: "no approved photos yet — validate at least one first." },
      { status: 400 },
    );
  }

  // Sanity: ensure every approved handle has its public/images/{handle}.png
  const missingFiles: string[] = [];
  for (const h of approved) {
    try {
      await stat(path.join(process.cwd(), "public", "images", `${h}.png`));
    } catch {
      missingFiles.push(h);
    }
  }
  if (missingFiles.length > 0) {
    return NextResponse.json(
      { error: `missing PNGs in public/images for: ${missingFiles.join(", ")}` },
      { status: 500 },
    );
  }

  const { updated, missing } = await rewriteProductsTs(approved);

  // Stage + commit only what changed (products.ts + the new images).
  const filesToAdd = [
    "lib/products.ts",
    ...approved.map((h) => `public/images/${h}.png`),
  ];
  const add = await runCmd("git", ["add", ...filesToAdd]);
  if (add.code !== 0) {
    return NextResponse.json(
      { error: `git add failed: ${add.stderr}` },
      { status: 500 },
    );
  }

  const message =
    `chore(images): batch refresh — ${updated.length} product photo${updated.length > 1 ? "s" : ""} via /admin/photos`;
  const commit = await runCmd("git", ["commit", "-m", message]);
  if (commit.code !== 0 && !commit.stdout.includes("nothing to commit")) {
    return NextResponse.json(
      { error: `git commit failed: ${commit.stderr || commit.stdout}` },
      { status: 500 },
    );
  }

  // Vercel deploy (--yes skips prompts; --prod targets production)
  const deploy = await runCmd("npx", ["vercel", "--prod", "--yes"]);
  const deployUrl = (deploy.stdout.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? []).pop();

  // Clear the approved log so the next session starts fresh
  await writeFile(APPROVED_LOG, JSON.stringify([], null, 2));

  return NextResponse.json({
    ok: true,
    updatedCount: updated.length,
    updated,
    missing,
    deployUrl,
    deployLog: deploy.stdout.split("\n").slice(-15).join("\n"),
  });
}
