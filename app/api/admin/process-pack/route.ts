/**
 * POST /api/admin/process-pack
 *
 * Generates a "pack" composition photo: Gemini receives N source
 * airplane images and is asked to place all of them together in a
 * single scene (desk / shelf / showroom). Output lands at
 * .tmp/preview/{handle}--{view}.png (or {handle}.png for "profile").
 *
 * Body:
 *   {
 *     handle:        string       // the pack's product handle
 *     sourceHandles: string[]     // 2-4 airplane handles to combine
 *     view:          "profile" | "3quarter-front" | "3quarter-rear" |
 *                    "top" | "shelf" | "desk"
 *     extraPrompt?:  string       // optional operator nudge
 *   }
 *
 * Local dev only.
 */

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { mkdir, stat, writeFile, copyFile } from "fs/promises";
import path from "path";
import { PRODUCTS } from "@/lib/products";

export const runtime = "nodejs";
export const maxDuration = 300;

type PackView =
  | "profile"
  | "3quarter-front"
  | "3quarter-rear"
  | "top"
  | "shelf"
  | "desk";

/** Scene direction per view — every pack shot stages the airplanes on
 *  a SINGLE floating dark walnut SHELF mounted against a matte black
 *  wall (house pack reference). Only the camera angle changes between
 *  views. Wider framing (planes fill ~55% of the canvas) so the shelf
 *  + room context is visible. */
const PACK_VIEWS: Record<PackView, string> = {
  profile:
    "CAMERA — slight three-quarter angle from the FRONT-RIGHT, ~20° off " +
    "the shelf's centerline, ~10° above the wing line. Wide framing — " +
    "the airplane group fills ~55% of the canvas width, the shelf is " +
    "fully visible left-to-right with ~20% black wall above and ~15% " +
    "below. ALL NOSES POINT TO THE LEFT.",
  "3quarter-front":
    "CAMERA — slight three-quarter angle from the FRONT-LEFT (closer to " +
    "the noses), ~35° off the shelf's centerline. The cockpits of every " +
    "airplane are prominent. Wide framing (planes ~55% of canvas). Noses " +
    "still point to the LEFT.",
  "3quarter-rear":
    "CAMERA — slight three-quarter angle from the BEHIND-RIGHT (closer to " +
    "the tails), ~35° off the shelf's centerline. Tail fins and engine " +
    "nozzles prominent. Wide framing. Noses point to the LEFT.",
  top:
    "CAMERA — STRAIGHT DOWN on the shelf (bird's-eye view, ~90° pitch). " +
    "All fuselages parallel, noses to the LEFT, both wings of every plane " +
    "fully spread. The shelf is rectangular under the row of airplanes.",
  shelf:
    "CAMERA — straight-on side angle on the shelf, eye-level with the " +
    "wings. Wide framing — the shelf occupies the lower third of the " +
    "frame, planes centered, ~20% breathing room above and below. Noses " +
    "to the LEFT.",
  desk:
    "CAMERA — slight three-quarter front-right angle, lower viewpoint as " +
    "if the shelf were mounted at desk-height. Wide framing. Noses to the " +
    "LEFT. (Same shelf staging — NO desk surface, NO notebook, NO lamp; " +
    "just the shelf and the planes on the matte black wall, only the " +
    "camera position changes.)",
};

const PACK_STUDIO_SCENE =
  "STAGING (mandatory, identical across every pack shot) — the airplanes " +
  "sit on a single FLOATING DARK WALNUT SHELF: a horizontal wooden plank " +
  "~4cm thick, matte finish, clean straight edges, mounted on a deep " +
  "matte BLACK wall (#0a0a12). NO visible brackets, NO horizon line, NO " +
  "second shelf, NO desk surface, NO props. The shelf is CENTERED " +
  "horizontally and runs across the LOWER THIRD of the frame.\n" +
  "BACKGROUND — wall is pure matte black (#0a0a12) above the shelf and " +
  "just below, with a soft warm halo of light pooling on the wall right " +
  "behind the airplanes (gentle elliptical glow). Fully opaque, no extra " +
  "lighting effects.\n" +
  "FRAMING — square 1:1 canvas, generous margins on every side so the " +
  "shelf, every airplane, and the warm halo are ALL fully visible. The " +
  "airplane group fills approximately 55% of the canvas width — this is " +
  "a deliberately DEZOOMÉ wide shot so the shelf context reads.\n" +
  "LIGHTING — single soft warm key-light from upper-left at ~45°, gentle " +
  "gloss on every fuselage, soft contact shadow under each stand on the " +
  "shelf surface.\n" +
  "QUALITY — sharp focus on EVERY airplane, all fully visible, no halo, " +
  "no haze, no faded edges, no partial transparency. Premium boutique " +
  "showroom catalog vibe.";

function planeTitle(handle: string): string {
  return PRODUCTS.find((p) => p.handle === handle)?.title ?? handle;
}

/** Per-pack scene override. Some packs benefit from a richer "office
 *  bookshelf" staging (more spacing, props, wider crop) — applied on
 *  top of the standard prompt. */
const PACK_SCENE_OVERRIDES: Record<string, string> = {
  "pack-trio-airbus-premium-a320-a350-a380":
    "SCENE OVERRIDE — staged on a LARGE office-style bookshelf shot.\n" +
    "• Shelf is 50% WIDER than usual, runs almost edge-to-edge across the " +
    "  frame's lower-third.\n" +
    "• Airplanes spaced 30% FURTHER APART (clear breathing room between " +
    "  each model — at least one airplane width between them).\n" +
    "• Airplanes WIDER ZOOM-OUT — the group now fills only ~45% of the " +
    "  canvas width, leaving more room for the shelf + lived-in props.\n" +
    "• Add lived-in office decor ON THE SHELF (alongside the airplanes, " +
    "  off to the side, never overlapping the planes): a short row of " +
    "  closed vintage hardcover BOOKS with leather spines (dark green, " +
    "  burgundy, navy), a small brass desk clock or globe. Decor lives " +
    "  on the LEFT END of the shelf so it doesn't compete with the planes.\n" +
    "• Background still matte black wall + warm halo — same house style.",
  "pack-collection-boeing":
    "SCENE OVERRIDE — staged on a LARGE office-style bookshelf shot.\n" +
    "• Shelf is 50% WIDER than usual, runs almost edge-to-edge across the " +
    "  frame's lower-third.\n" +
    "• Airplanes spaced 30% FURTHER APART (clear breathing room — at " +
    "  least one airplane width between each model).\n" +
    "• Airplanes WIDER ZOOM-OUT — the group fills only ~45% of canvas " +
    "  width, more shelf + decor visible.\n" +
    "• Add lived-in office decor ON THE SHELF: a row of closed vintage " +
    "  hardcover BOOKS with leather spines (dark green, burgundy, navy) " +
    "  on the LEFT end of the shelf, plus a small brass globe or vintage " +
    "  camera off to the side. Never overlap the planes.\n" +
    "• Background still matte black wall + warm halo — same house style.",
};

/** Pull a product's current image into .tmp/current/{handle}.{ext}. */
async function stageImage(handle: string): Promise<string> {
  const product = PRODUCTS.find((p) => p.handle === handle);
  if (!product) return `error: product ${handle} not found`;
  const img = product.image;
  const ext = (img.split(".").pop() || "png").toLowerCase().split("?")[0];
  const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";
  const tmpDir = path.join(process.cwd(), ".tmp", "current");
  await mkdir(tmpDir, { recursive: true });
  const dest = path.join(tmpDir, `${handle}.${safeExt}`);
  if (img.startsWith("http")) {
    const res = await fetch(img, {
      headers: { "User-Agent": "AirplaneStoreAdmin/1.0" },
    });
    if (!res.ok) return `error: ${img} → HTTP ${res.status}`;
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  } else if (img.startsWith("/")) {
    const src = path.join(process.cwd(), "public", img.replace(/^\//, ""));
    await copyFile(src, dest);
  } else {
    return `error: unsupported url ${img}`;
  }
  return dest;
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Pack pipeline is local-only." },
      { status: 501 },
    );
  }

  const { handle, sourceHandles, view, extraPrompt } = await req.json();
  if (!handle || !/^[a-z0-9-]+$/i.test(handle)) {
    return NextResponse.json({ error: "invalid handle" }, { status: 400 });
  }
  if (
    !Array.isArray(sourceHandles) ||
    sourceHandles.length < 2 ||
    sourceHandles.length > 4
  ) {
    return NextResponse.json(
      { error: "sourceHandles must be a 2-4 string array" },
      { status: 400 },
    );
  }
  const viewKey = (view && (view as PackView) in PACK_VIEWS
    ? view
    : "profile") as PackView;

  // Stage every source image to .tmp/current/
  const stagedPaths: string[] = [];
  for (const h of sourceHandles) {
    const r = await stageImage(h);
    if (r.startsWith("error:")) {
      return NextResponse.json({ error: `${h}: ${r}` }, { status: 502 });
    }
    stagedPaths.push(r);
  }

  const titles = sourceHandles.map(planeTitle);
  const numbered = titles.map((t, i) => `(image ${i + 1}) ${t}`).join("\n  ");
  let prompt =
    `Compose a SINGLE catalog product photo of the "${planeTitle(handle)}" — ` +
    `a curated collection of ${sourceHandles.length} airplane models on ` +
    `wooden display stands.\n\n` +
    `THE ${sourceHandles.length} AIRPLANES (one source image attached for ` +
    `each, in this exact order):\n  ${numbered}\n\n` +
    `MANDATORY COMPOSITION (zero tolerance):\n` +
    `1. Show ALL ${sourceHandles.length} airplanes — count them: ` +
    `${sourceHandles.length} DISTINCT, SEPARATE airplane models in the frame. ` +
    `Not two, not four — exactly ${sourceHandles.length}. ` +
    `If any model is missing or duplicated, the image is REJECTED.\n` +
    `2. Each airplane sits on its OWN individual wooden display stand ` +
    `(separate base, separate chrome arm). No shared base. The ` +
    `${sourceHandles.length} stands are aligned in a row, evenly spaced ` +
    `with clear gap between each (~10% of the airplane's width).\n` +
    `3. Order LEFT to RIGHT by physical size, SMALLEST on the LEFT, ` +
    `LARGEST on the RIGHT. (For Airbus: A320 left, A350 middle, A380 right. ` +
    `For Boeing: 737/787 left, 747/777 right.)\n` +
    `4. Each airplane is FULLY VISIBLE — no overlap, no occlusion, no ` +
    `tail/wing cropped, no plane hidden behind another. Generous margin ` +
    `around the group.\n` +
    `5. Each airplane keeps its OWN livery EXACTLY as shown in its source ` +
    `image (airline name, colors, decals, registration). Never mix two ` +
    `liveries onto one plane.\n` +
    `6. Sizes are roughly proportional to the real-life aircraft — the ` +
    `bigger model in real life is the bigger model in the frame.\n\n` +
    `${PACK_VIEWS[viewKey]}\n\n` +
    PACK_STUDIO_SCENE +
    (PACK_SCENE_OVERRIDES[handle] ? "\n\n" + PACK_SCENE_OVERRIDES[handle] : "") +
    "\n\nREMOVE floating watermarks, URLs, gold-plane glyphs. KEEP every " +
    "painted marking on each airplane.";

  const cleanExtra =
    typeof extraPrompt === "string"
      ? extraPrompt.trim().slice(0, 500).replace(/[ -]/g, " ")
      : "";
  if (cleanExtra) {
    prompt =
      `ADDITIONAL OPERATOR INSTRUCTION (highest priority): ${cleanExtra}\n\n` +
      prompt;
  }

  const previewDir = path.join(process.cwd(), ".tmp", "preview");
  await mkdir(previewDir, { recursive: true });
  const dest =
    viewKey === "profile"
      ? path.join(previewDir, `${handle}.png`)
      : path.join(previewDir, `${handle}--${viewKey}.png`);

  const script = path.join(process.cwd(), "scripts", "enhance_product_photo.py");
  const args = [
    script,
    stagedPaths[0],
    dest,
    "--prompt",
    prompt,
    "--no-rembg",
    "--no-frame",
  ];
  if (stagedPaths[1]) args.push("--reference", stagedPaths[1]);
  for (const extra of stagedPaths.slice(2)) {
    args.push("--extra-reference", extra);
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
            sources: sourceHandles,
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
