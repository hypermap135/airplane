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
    // CANONICAL ORIENTATION: NOSE ALWAYS TO THE RIGHT, across every view.
    // Same direction as a takeoff roll on a runway — the eye reads the
    // airplane from tail to nose, left to right. Mixing directions kills
    // the catalog consistency.
    angleClause:
      "STANDARD CATALOG VIEW (the cover shot). Camera placed at a slight " +
      "front-side angle, ~20° off the centerline, ~10° above the wing. " +
      "Result: we see the LEFT side of the fuselage with the NOSE POINTING " +
      "TO THE RIGHT of the frame, the cockpit windows visible at the right, " +
      "the tail at the left, the near wing slightly foreshortened, both " +
      "engines visible underneath. This is NOT a pure side profile and NOT " +
      "a front view — it's the slight 3/4 cover shot used as the catalog " +
      "thumbnail.",
  },
  "3quarter-front": {
    label: "3/4 avant",
    angleClause:
      "STRICT THREE-QUARTER FRONT VIEW (NOT side, NOT rear). Camera positioned " +
      "IN FRONT of and to the LEFT of the airplane, looking BACK at it " +
      "from a 35° offset to the centerline, ~12° above the wing. WHAT WE " +
      "MUST SEE: the cockpit windows LARGE in the upper-right area of the " +
      "frame, the nose pointing TOWARDS THE CAMERA and slightly to the " +
      "RIGHT, both engines visible at the front, the entire left side of " +
      "the fuselage receding toward the tail at the back-left of the frame. " +
      "The TAIL is small and far away. The COCKPIT is the dominant feature. " +
      "REJECTED if we cannot see the cockpit windows prominently, or if the " +
      "tail is closer to the camera than the nose.",
  },
  "3quarter-rear": {
    label: "3/4 arrière",
    angleClause:
      "STRICT THREE-QUARTER REAR VIEW (NOT side, NOT front, NOT top). Camera " +
      "positioned BEHIND and to the LEFT of the airplane, looking FORWARD " +
      "toward the nose from a 35° offset, ~12° above the wing. WHAT WE " +
      "MUST SEE: the TAIL FIN LARGE and in the foreground (left side of " +
      "frame), both engine NOZZLES (jet pipes / exhausts) visible from the " +
      "back, the upper surface of the wings receding toward the nose at " +
      "the front-right of the frame. The COCKPIT is small and far away in " +
      "the top-right area. NOSE POINTS TO THE RIGHT but is the FURTHEST " +
      "point from the camera. REJECTED if we cannot see the tail fin large " +
      "in the foreground, or if the cockpit is closer to the camera than " +
      "the tail.",
  },
  top: {
    label: "Dessus",
    angleClause:
      "STRICT TOP-DOWN PLAN VIEW. Camera placed DIRECTLY ABOVE the airplane, " +
      "pointing straight down at the wings (bird's eye view, ~90° pitch). " +
      "WHAT WE MUST SEE: the airplane lying horizontally across the frame, " +
      "both wings fully spread left-right symmetric, the fuselage running " +
      "horizontally with the NOSE POINTING TO THE RIGHT and the tail to " +
      "the LEFT, top of fuselage visible (no side panels, no engines from " +
      "below). The wooden stand is hidden underneath the airplane (we are " +
      "looking AT the top of the model). REJECTED if any cockpit window or " +
      "engine intake is visible (those are side/front features), or if the " +
      "perspective shows depth (it must be flat top-down).",
  },
  shelf: {
    label: "Sur étagère",
    customPrompt: (plane) =>
      `Re-render this "${plane}" 1:144 scale model in a premium showroom scene.\n\n` +
      "SCENE (MANDATORY) — the airplane (on its wooden display stand) MUST " +
      "BE STANDING ON A SINGLE FLOATING DARK WALNUT SHELF — a horizontal " +
      "wooden plank, ~4cm thick, matte finish, clean straight edges, " +
      "mounted on the wall as a floating shelf (NO visible brackets). The " +
      "shelf is CENTERED HORIZONTALLY and runs across the LOWER THIRD of " +
      "the frame. Behind the shelf: a deep matte BLACK wall (#080810). " +
      "Soft warm key-light from the upper-left, subtle shadow of the " +
      "wooden stand on the shelf. REJECTED if there's no visible shelf, " +
      "if the shelf is missing the floating-edge look, or if the " +
      "background isn't a uniform black wall.\n\n" +
      "COMPOSITION — plane fills ~70% of the SQUARE 1:1 frame, slight " +
      "three-quarter front-side view (camera ~20° off the centerline, " +
      "~15° above the wing), NOSE POINTING TO THE RIGHT, cockpit windows " +
      "visible.\n\n" +
      `LIVERY — KEEP EXACTLY as in the source. ${plane} colors, wordmark, ` +
      "tail logo, registration, decals — pixel-perfect. Never invent.\n\n" +
      "QUALITY — sharp focus, no halo, no transparency, fully opaque " +
      "surfaces, premium boutique catalog look. REMOVE floating watermarks, " +
      "URLs, gold glyphs. NO checker pattern, NO added text.",
  },
  desk: {
    label: "Sur un bureau",
    customPrompt: (plane) =>
      `Re-render this "${plane}" 1:144 scale model staged on a modern desk.\n\n` +
      "SCENE (MANDATORY) — the airplane (on its wooden display stand) MUST " +
      "BE STANDING ON A REAL DESK SURFACE: a clean matte DARK WALNUT WOOD " +
      "horizontal desk that FILLS THE LOWER HALF of the frame, edge of " +
      "the desk visible at the bottom. In the BACKGROUND (heavily blurred, " +
      "f/2.0 bokeh, NOT in focus): a closed leather notebook, a small " +
      "brass desk lamp on the right, a neutral charcoal wall. Soft natural " +
      "daylight from upper-left (window-style), warm contact shadow under " +
      "the wooden stand. REJECTED if there's no visible wood desk surface " +
      "below the airplane, if the background isn't a blurred office scene, " +
      "or if no notebook/lamp is hinted at in the bokeh.\n\n" +
      "COMPOSITION — plane fills ~65% of the SQUARE 1:1 frame, slight " +
      "three-quarter front-side view (camera ~20° off the centerline, " +
      "~15° above the wing), NOSE POINTING TO THE RIGHT.\n\n" +
      `LIVERY — KEEP EXACTLY as in the source. ${plane} colors, wordmark, ` +
      "tail logo, registration, decals — pixel-perfect. Never invent.\n\n" +
      "QUALITY — sharp focus on the airplane (only the BACKGROUND is " +
      "blurred), no halo, fully opaque surfaces, premium executive vibe. " +
      "REMOVE floating watermarks, URLs, gold glyphs. NO checker pattern, " +
      "NO transparency, NO added text, NO computer screens or visible text.",
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

/**
 * Per-handle prompt addenda — appended AFTER the standard rules when a
 * specific product needs extra hand-holding (the generic prompt keeps
 * failing it). Add an entry here when a product takes 3+ regenerations
 * to land. Each addendum is treated as a HARD override.
 */
const PRODUCT_PROMPT_OVERRIDES: Record<string, string> = {
  // Airbus A320 Air France — Gemini keeps drifting on this one: wrong
  // angle, wrong framing, livery faded. Explicit description forces it.
  "a320-neo":
    "MANDATORY for this product (override any conflicting interpretation): " +
    "the airplane is an AIRBUS A320 in modern AIR FRANCE livery. " +
    "Fuselage: white. Cockpit window line is dark blue. A thin BLUE stripe " +
    "runs along the entire fuselage at the window-line level. The tail fin " +
    "is split into vertical BLUE / WHITE / RED bands (French tricolore) " +
    "with the curved 'AIR FRANCE' ribbon in BLUE on the white middle. " +
    "'AIR FRANCE' wordmark in BLUE on the upper forward fuselage. " +
    "Registration code 'F-XXXX' in small black letters on the rear " +
    "fuselage. Two engines under the wings in matte grey with dark inlets. " +
    "ORIENTATION: slight three-quarter side view with the NOSE POINTING TO " +
    "THE RIGHT, the airplane tilted ~20° toward the camera, camera ~10° " +
    "above the wing. The plane (with its wooden display stand) fills " +
    "EXACTLY 80% of the square 1:1 canvas, centered horizontally, " +
    "perfectly symmetric framing — same composition as every other " +
    "product in the catalog. Do NOT crop wingtips, tail, nose, or stand. " +
    "Do NOT switch to a head-on view. Do NOT flip the orientation. " +
    "Background MUST be the standard dark charcoal studio gradient " +
    "(#1c1c26 center → #0a0a12 corners), no props, no scene.",
};

/** ONE unified studio scene shared by every standard view. Same exact
 *  background, lighting, and framing across all products — only the
 *  airplane changes. Catalog grid stays visually coherent. */
const STUDIO_SCENE =
  "BACKGROUND — fixed dark charcoal studio: gentle radial gradient from " +
  "#1c1c26 at center to #0a0a12 at corners. Fully opaque, smooth, " +
  "uniform across every product — IDENTICAL background on every shot, no " +
  "props, no clutter, no extra lighting effects, no shadow on the wall.\n" +
  "FRAME — perfectly SQUARE 1:1 canvas. The airplane (with its wooden " +
  "stand) is centered horizontally, fills exactly 80% of the canvas " +
  "width, with generous margin so wingtips, tail and nose are FULLY " +
  "VISIBLE — never cropped, never touching the edges. SAME framing across " +
  "every product in the catalog.\n" +
  "LIGHTING — single soft warm key-light from upper-left at ~45°, subtle " +
  "gloss on the fuselage paint, a soft contact shadow only DIRECTLY UNDER " +
  "the wooden stand. No rim light, no second source, no colored gels.\n" +
  "QUALITY — clean opaque surfaces everywhere, sharp focus on the " +
  "airplane, no halo, no haze, no faded edges, no partial transparency. " +
  "Premium luxury aviation catalog vibe.";

function buildPromptForView(view: string, handle: string): string {
  const spec = VIEWS[view] ?? VIEWS.profile;
  if (spec.customPrompt) return spec.customPrompt(describePlane(handle));
  const angle = spec.angleClause ?? VIEWS.profile.angleClause!;
  const plane = describePlane(handle);
  const override = PRODUCT_PROMPT_OVERRIDES[handle];
  let prompt =
    `Generate a premium catalog photo of this "${plane}" 1:144 scale model ` +
    "on its wooden display stand. The product photo must match EXACTLY the " +
    "house style — only the airplane itself varies between products.\n\n" +
    `LIVERY — KEEP EXACTLY as in the source. ${plane} colors, airline ` +
    "wordmark, tail logo, registration code, decals, stripes, window line — " +
    "every detail PIXEL-PERFECT. Never invent a new name. Never replace " +
    "with white. If you can't read a letter, copy it from the source.\n" +
    `ANGLE — ${angle}\n` +
    STUDIO_SCENE + "\n" +
    "REMOVE ONLY: floating watermarks, URLs, gold-plane glyphs, site-name " +
    "overlays. KEEP every painted marking on the airplane itself.";
  if (override) prompt += "\n\n" + override;
  return prompt;
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
  // rembg + frame disabled across the board: the alpha matte step was
  // grinding off livery details, leaving fuzzy edges, and rejecting
  // colored areas as "background" — destroying the very thing we want
  // to preserve. Gemini now bakes the dark charcoal studio background
  // into the image directly, so we keep its output verbatim.
  const args = [script, source, dest, "--prompt", prompt, "--no-rembg", "--no-frame"];
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
