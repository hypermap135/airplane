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
    label: "Modèle de base",
    // "Profile" view is actually the canonical 3/4 catalog shot — slightly
    // off-side so the customer reads the airline livery + cockpit + engines
    // in one glance. Pure side profile killed the depth, that's why the
    // user complained.
    angleClause:
      "Slight three-quarter side view, nose pointing to the RIGHT and tilted ~20° toward the camera, both engines and cockpit windows clearly visible, the airplane sits at a slightly elevated angle (camera ~10° above the wing).",
  },
  "3quarter-front": {
    label: "3/4 avant",
    angleClause:
      "Three-quarter front view: the airplane angled ~35° toward the camera, nose pointing slightly to the right, cockpit windows large and centered.",
  },
  "3quarter-rear": {
    label: "3/4 arrière",
    angleClause:
      "Three-quarter rear view: the airplane angled ~35° away from the camera, tail fin and engines prominent, nose pointing slightly to the left.",
  },
  top: {
    label: "Dessus",
    angleClause:
      "Top-down view, fuselage running horizontally across the frame, both wings fully spread.",
  },
  shelf: {
    label: "Sur étagère",
    customPrompt: (plane) =>
      `Re-render this "${plane}" 1:144 scale model in a premium showroom scene.\n\n` +
      "SCENE — place the airplane (on its wooden display stand) on a single " +
      "FLOATING DARK WALNUT SHELF (matte, ~4cm thick, clean straight edges) " +
      "mounted against a deep matte BLACK wall (#080810). Shelf centered " +
      "horizontally, runs across the lower third of the frame. Soft warm " +
      "key-light from upper-left, subtle shadow on the shelf.\n\n" +
      "COMPOSITION — plane fills ~70% of the SQUARE 1:1 frame, slightly " +
      "elevated viewing angle (~15°), 3/4 front-side with nose pointing " +
      "to the right.\n\n" +
      `LIVERY — KEEP EXACTLY as in the source. ${plane} colors, wordmark, ` +
      "tail logo, registration, decals — pixel-perfect. Never invent.\n\n" +
      "QUALITY — RAZOR-SHARP focus everywhere, no halo, no blur around " +
      "engines/wings, fully opaque surfaces, premium boutique catalog look. " +
      "REMOVE floating watermarks, URLs, gold glyphs. NO checker pattern, " +
      "NO transparency, NO added text.",
  },
  desk: {
    label: "Sur un bureau",
    customPrompt: (plane) =>
      `Re-render this "${plane}" 1:144 scale model staged on a modern desk.\n\n` +
      "SCENE — clean matte DARK WALNUT WOOD DESK SURFACE filling the lower " +
      "half of the frame. Deep blurry background (heavy bokeh, f/2.0): a " +
      "hint of a closed leather notebook, a small brass lamp out of focus, " +
      "a neutral charcoal wall. Soft natural daylight from upper-left, warm " +
      "contact shadow under the wooden stand.\n\n" +
      "COMPOSITION — plane fills ~65% of the SQUARE 1:1 frame, slightly " +
      "elevated viewing angle (~15°), 3/4 front-side with nose pointing " +
      "to the right.\n\n" +
      `LIVERY — KEEP EXACTLY as in the source. ${plane} colors, wordmark, ` +
      "tail logo, registration, decals — pixel-perfect. Never invent.\n\n" +
      "QUALITY — RAZOR-SHARP focus on the airplane (only the BACKGROUND " +
      "is blurred via depth-of-field), no halo, fully opaque surfaces, " +
      "premium executive vibe. REMOVE floating watermarks, URLs, gold " +
      "glyphs. NO checker pattern, NO transparency, NO added text, NO " +
      "computer screens or visible text in the background.",
  },
};

/** Lookup the product's full title (e.g. "Airbus A320 Air France") so it
 *  can be injected into the Gemini prompt as an unambiguous identifier.
 *  When Gemini knows it's looking at an Air France livery, it stops
 *  hallucinating white-fuselage replacements. */
function describePlane(handle: string): string {
  const p = PRODUCTS.find((pp) => pp.handle === handle);
  if (!p) return "an airline model airplane";
  return p.title;
}

function buildPromptForView(view: string, handle: string): string {
  const spec = VIEWS[view] ?? VIEWS.profile;
  if (spec.customPrompt) return spec.customPrompt(describePlane(handle));
  const angle = spec.angleClause ?? VIEWS.profile.angleClause!;
  const plane = describePlane(handle);
  // KEEP THIS PROMPT SHORT AND DIRECT.
  // Multiple iterations of "more rules → worse output" proved that long
  // multi-paragraph prompts cause Gemini to drop the livery, change the
  // angle, or fade colors. Five rules max — each one a single line.
  return (
    `This is a product photo of a "${plane}" 1:144 scale model on a wooden ` +
    "display stand. Generate a CLEAN PREMIUM CATALOG SHOT with these rules:\n\n" +
    `1. LIVERY — KEEP EXACTLY as in the source. ${plane} colors, airline ` +
    "wordmark, tail logo, registration code, decals, stripes, window line — " +
    "every detail PIXEL-PERFECT. Never invent a new name. Never replace " +
    "with white. If you can't read a letter, copy it from the source.\n" +
    `2. ANGLE — ${angle}\n` +
    "3. FRAME — the airplane (with its wooden stand) fills ~85% of a SQUARE " +
    "1:1 frame, centered, generous margin so wingtips, tail and nose are " +
    "FULLY VISIBLE (never cropped).\n" +
    "4. BACKGROUND — clean light-grey studio gradient (#c8ccd2 at center → " +
    "#9aa0a8 at edges). Fully opaque, no checker, no transparency, no " +
    "stripes, no shadows on the background other than a soft contact " +
    "shadow under the wooden stand.\n" +
    "5. LIGHT & FINISH — soft warm key-light from upper-left, subtle gloss " +
    "on the fuselage paint, RAZOR-SHARP focus on every part of the airplane " +
    "(no halo, no haze, no blur around engines or wings). Premium luxury " +
    "catalog vibe — the image must make the customer want to buy it.\n\n" +
    "REMOVE ONLY: floating watermarks, URLs, gold-plane glyphs, site-name " +
    "overlays. KEEP every painted marking on the airplane itself."
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

  const { handle, sourcePath, useCurrent, view, useReference, extraPrompt } =
    await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }
  const viewKey = view && VIEWS[view] ? view : "profile";
  // Optional free-form instruction from the operator (e.g. "garde les bandes
  // tricolores rouge/bleu sur le fuselage"). Truncated + light cleanup to
  // avoid prompt-injection or unbounded payloads.
  const cleanExtra =
    typeof extraPrompt === "string"
      ? extraPrompt.trim().slice(0, 500).replace(/[ -]/g, " ")
      : "";

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
  let prompt = buildPromptForView(viewKey, handle);
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
  if (cleanExtra) {
    // Operator's free-form instruction wins over the generic livery rules
    // — surface it at the very top so Gemini sees it before the
    // boilerplate. Translated to a clear English directive.
    prompt =
      `ADDITIONAL OPERATOR INSTRUCTION (highest priority — apply this even if ` +
      `it contradicts the rules below): ${cleanExtra}\n\n` +
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
