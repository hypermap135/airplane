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

/**
 * Six standard angles for the 360-style product gallery. The base prompt
 * (cleanup + identical livery + 1400×1400 frame) is preserved — only the
 * "(6) angle" clause changes per view. Gemini doesn't truly rotate a 3D
 * model, but with a strong source photo it does a reasonable job of
 * re-rendering the same livery from a hinted angle.
 */
type ViewSpec = {
  label: string;
  /** Custom prompt builder when the view needs a non-standard background
   *  (e.g. shelf scene). Falls back to the standard light-grey studio. */
  customPrompt?: (planeContext: string) => string;
  /** Angle/composition clause used by the standard light-grey prompt. */
  angleClause?: string;
};

const VIEWS: Record<string, ViewSpec> = {
  profile: {
    label: "Profil",
    angleClause:
      "Pure side profile view, plane facing right, both wings visible from the side.",
  },
  "3quarter-front": {
    label: "3/4 avant",
    angleClause:
      "Three-quarter front view: the airplane angled ~30° toward the camera, nose pointing slightly to the right, cockpit windows clearly visible.",
  },
  "3quarter-rear": {
    label: "3/4 arrière",
    angleClause:
      "Three-quarter rear view: the airplane angled ~30° away from the camera, tail fin and engines prominent.",
  },
  top: {
    label: "Dessus",
    angleClause:
      "Top-down view, fuselage running horizontally across the frame, both wings fully spread.",
  },
  shelf: {
    label: "Sur étagère",
    customPrompt: () =>
      "Re-render this airplane model in a premium showroom scene. SCENE: place the " +
      "airplane (on its wooden display stand) on a single FLOATING DARK WALNUT SHELF " +
      "(matte finish, ~4 cm thick, clean straight edges) mounted against a deep " +
      "matte BLACK wall (#080810). The shelf is centered horizontally and runs " +
      "across the lower third of the frame. A single soft warm key-light from the " +
      "upper-left illuminates the airplane, casting a subtle shadow on the shelf. " +
      "The plane fills ~70% of the frame, slightly elevated viewing angle (~15°) " +
      "so we see the top of the wings, 3/4 front-side composition with the nose " +
      "pointing slightly to the right. " +
      "PRESERVE the airplane EXACTLY as in the source: same livery, same colors, " +
      "same registration, same shape — do not modify anything on the aircraft. " +
      "REMOVE all watermarks, URLs, gold glyphs, stray text. Premium museum / " +
      "luxury boutique presentation. Sharp focus, high resolution, professional " +
      "product photography. Square 1:1 format. NO transparency, NO checker pattern, " +
      "NO added text, NO new branding.",
  },
  desk: {
    label: "Sur un bureau",
    customPrompt: () =>
      "Re-render this airplane model staged on a modern workspace desk. SCENE: " +
      "place the airplane (on its wooden display stand) on a clean matte DARK " +
      "WALNUT WOOD DESK SURFACE that fills the lower half of the frame. " +
      "In the deep blurry background (heavy bokeh, f/2.0): a hint of a closed " +
      "leather notebook, a small brass lamp on the right out of focus, and a " +
      "neutral charcoal wall — premium executive office vibe. " +
      "Soft natural daylight from the upper-left (window-style), warm contact " +
      "shadow under the wooden stand. " +
      "The plane fills ~65% of the frame, slightly elevated viewing angle (~15°), " +
      "3/4 front-side composition with the nose pointing slightly to the right. " +
      "PRESERVE the airplane EXACTLY as in the source: same livery, same colors, " +
      "same registration, same shape — do not modify anything on the aircraft. " +
      "REMOVE all watermarks, URLs, gold glyphs, stray text. Upscale CEO desk " +
      "decoration vibe. Sharp focus on the airplane, blurred background. Square " +
      "1:1 format. NO transparency, NO checker pattern, NO added text, NO new " +
      "branding, NO computer screens or visible text in the background.",
  },
};

function buildPromptForView(view: string): string {
  const spec = VIEWS[view] ?? VIEWS.profile;
  if (spec.customPrompt) return spec.customPrompt("");
  const angle = spec.angleClause ?? VIEWS.profile.angleClause!;
  return (
    "You are retouching a product photo of an airplane model on a wooden " +
    "display stand. The airplane LIVERY (paint scheme, airline name, logo, " +
    "registration code, decals, tail markings, window line) is ALREADY CORRECT " +
    "in the source image. Your only job is to clean it up — DO NOT redesign " +
    "the livery, DO NOT invent new text, DO NOT change the airline name, DO " +
    "NOT make up any logo. " +
    "" +
    "RULES (strict, in order of priority): " +
    "(1) PRESERVE THE LIVERY EXACTLY as in the source. If the source shows " +
    "'AIRFRANCE' on the fuselage in blue letters, the output MUST show " +
    "'AIRFRANCE' in those same blue letters at the same position — character " +
    "for character. If the source shows 'EMIRATES', it stays 'EMIRATES'. " +
    "Never write 'AIRBUSS' or any other invented word. If you are not 100% " +
    "sure of a letter, copy it pixel-perfect from the source. " +
    "(2) PRESERVE every decal, tail flag, stripe pattern, registration code, " +
    "engine markings, and window line exactly. " +
    "(3) REMOVE only OBVIOUS watermarks that are clearly NOT painted on the " +
    "fuselage: e.g. floating 'www.something.com' URLs, semi-transparent " +
    "site-name overlays, gold airplane glyphs that don't belong to the " +
    "airline. Everything else stays. When in doubt, KEEP it. " +
    "(4) Keep the airplane shape, scale, and the wooden display stand exactly " +
    "as in the source — same nose, same wings, same tail, same engines. " +
    "(5) Place on a CLEAN LIGHT GREY studio background (around #c5c8cd at " +
    "centre fading to #9aa0a8 at edges) — no checker pattern, no transparency. " +
    "(6) The airplane fills approximately 85% of a square 1:1 frame. " +
    `(7) ANGLE: ${angle} ` +
    "(8) Studio key-light from above-left, soft contact shadow under the base, " +
    "sharp focus, high-resolution professional product photography. " +
    "" +
    "NEVER add new text. NEVER invent an airline name. NEVER change letters. " +
    "When unsure, copy from the source pixel-for-pixel."
  );
}

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

  const { handle, sourcePath, useCurrent, view, useReference } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }
  const viewKey = view && VIEWS[view] ? view : "profile";

  // Optionally include a reference image (.tmp/references/{handle}.*)
  // that the operator dropped from the photos studio. When present, the
  // pipeline tells Gemini to imitate that reference's livery/design.
  let referencePath: string | null = null;
  if (useReference) {
    const refDir = path.join(process.cwd(), ".tmp", "references");
    try {
      const refFiles = await readdir(refDir);
      const match = refFiles.find((f) => f.startsWith(`${handle}.`));
      if (match) referencePath = path.join(refDir, match);
    } catch {
      /* dir doesn't exist yet — fine, just no reference */
    }
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
  // Output file is suffixed with the view key, except for the default
  // "profile" which keeps the legacy {handle}.png path so older clients
  // still resolve.
  const dest =
    viewKey === "profile"
      ? path.join(previewDir, `${handle}.png`)
      : path.join(previewDir, `${handle}--${viewKey}.png`);

  // Spawn the Python pipeline with a view-specific prompt.
  // Scenic views (shelf, ...) keep the Gemini render verbatim — rembg
  // would strip the staged background and lose the whole point.
  const script = path.join(process.cwd(), "scripts", "enhance_product_photo.py");
  let prompt = buildPromptForView(viewKey);
  if (referencePath) {
    prompt =
      "TWO IMAGES are attached: " +
      "IMAGE 1 is the airplane model maquette to redraw (preserve its silhouette, " +
      "stand, and proportions). " +
      "IMAGE 2 is a real-world REFERENCE photo whose LIVERY, COLORS, AIRLINE " +
      "LOGO, REGISTRATION FONT, TAIL DESIGN, and stripe/wave patterns must be " +
      "transferred onto IMAGE 1's airplane. Match the reference's paint scheme " +
      "exactly (colors, wordmark placement, decals, window line) while keeping " +
      "IMAGE 1's airframe shape, scale, and wooden display stand. " +
      "Then apply the rest of the standard rules: " +
      prompt;
  }
  const SCENIC_VIEWS = new Set(["shelf", "desk"]);
  const args = [script, source, dest, "--prompt", prompt];
  if (SCENIC_VIEWS.has(viewKey)) {
    args.push("--no-rembg", "--no-frame");
  }
  if (referencePath) {
    // When a reference is in play, the prompt tells Gemini that
    // the second image is the design source. Tweak the prompt slightly.
    args.push("--reference", referencePath);
  }
  return new Promise<NextResponse>((resolve) => {
    const proc = spawn("python3", args, { cwd: process.cwd() });
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
        const previewSlug =
          viewKey === "profile" ? handle : `${handle}--${viewKey}`;
        resolve(
          NextResponse.json({
            ok: true,
            view: viewKey,
            previewUrl: `/api/admin/preview/${previewSlug}?t=${Date.now()}`,
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
