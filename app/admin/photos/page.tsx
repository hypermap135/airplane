import { PRODUCTS } from "@/lib/products";
import PhotoAdmin from "./PhotoAdmin";
import { readdir, readFile } from "fs/promises";
import path from "path";

/** Scan .tmp/preview/ at SSR time so the client always boots with the
 *  correct "which previews already exist" state — no client fetch, no
 *  auth-cookie issue, no race condition. */
async function scanPreviews(): Promise<Record<string, string[]>> {
  if (process.env.VERCEL) return {};
  const dir = path.join(process.cwd(), ".tmp", "preview");
  const VIEW_KEYS = new Set([
    "profile",
    "3quarter-front",
    "3quarter-rear",
    "top",
    "shelf",
    "desk",
  ]);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return {};
  }
  const out: Record<string, string[]> = {};
  for (const f of files) {
    if (!f.endsWith(".png")) continue;
    const base = f.slice(0, -4);
    const sep = base.lastIndexOf("--");
    let handle: string;
    let view: string;
    if (sep >= 0) {
      handle = base.slice(0, sep);
      view = base.slice(sep + 2);
      if (!VIEW_KEYS.has(view)) continue;
    } else {
      handle = base;
      view = "profile";
    }
    if (!out[handle]) out[handle] = [];
    if (!out[handle].includes(view)) out[handle].push(view);
  }
  return out;
}

/** Which handles already have a reference photo on disk. Used to hydrate
 *  the "🎯 RÉFÉRENCE" pane on first paint. */
async function scanReferences(): Promise<Record<string, true>> {
  if (process.env.VERCEL) return {};
  const dir = path.join(process.cwd(), ".tmp", "references");
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return {};
  }
  const out: Record<string, true> = {};
  for (const f of files) {
    const dot = f.lastIndexOf(".");
    if (dot <= 0) continue;
    const handle = f.slice(0, dot);
    if (/^[a-z0-9-]+$/i.test(handle)) out[handle] = true;
  }
  return out;
}

type PublishedEntry = { handle: string; deployUrl?: string | null; at: string };

/** Which handles have already shipped to production. The admin /photos
 *  listing hides them by default (chip "🚀 Publiées" brings them back).
 *  The product is considered done — operator moves on to the next one. */
async function scanPublished(): Promise<Record<string, PublishedEntry>> {
  if (process.env.VERCEL) return {};
  const file = path.join(process.cwd(), ".tmp", "published.json");
  try {
    const raw = await readFile(file, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return {};
    const out: Record<string, PublishedEntry> = {};
    for (const item of parsed as PublishedEntry[]) {
      if (item?.handle && /^[a-z0-9-]+$/i.test(item.handle)) {
        out[item.handle] = item;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Admin photo-picker UI.
 *
 * Lists every product on the site with its current image. The user can:
 *   1. Upload a new source photo (drag-drop or file picker)
 *   2. Click "Lancer le pipeline" → Gemini + rembg + framing
 *   3. Compare current image vs preview
 *   4. Click "Valider" → image is promoted to public/images/
 *
 * After validating all the photos for the session, the dev pulls the
 * .tmp/approved.json list, updates products.ts paths, and commits +
 * deploys in one batch.
 *
 * IMPORTANT: this entire flow runs LOCALLY via `npm run dev`. Vercel's
 * serverless functions can't write to disk or spawn Python, so on prod
 * the API routes return 501 by design.
 */
export const dynamic = "force-dynamic";

export default async function PhotosAdminPage() {
  // Every catalogue product is exposed to the studio — packs and
  // accessoires too, so the operator decides per-card whether to skip
  // (✅ Déjà fait) or run them through the pipeline.
  const products = PRODUCTS.map((p) => ({
    handle: p.handle,
    title: p.title,
    collection: p.collection,
    currentImage: p.image,
    inStock: p.inStock,
  }));

  const isVercel = !!process.env.VERCEL;
  const existingPreviews = await scanPreviews();
  const existingReferences = await scanReferences();
  const existingPublished = await scanPublished();

  return (
    <div className="min-h-screen bg-[#06060f] text-white pt-24 pb-32 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1
            className="font-black mb-3"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            📸 Admin — Photos produit
          </h1>
          <p className="text-white/55 max-w-2xl">
            Upload une nouvelle photo source pour chaque produit. Le pipeline
            (Gemini + rembg + cadrage 1400×1400) s&apos;applique automatiquement.
            Compare l&apos;ancien et le nouveau côte à côte avant de valider.
          </p>

          {isVercel && (
            <div
              className="mt-6 rounded-xl p-5 border"
              style={{
                background: "rgba(255,80,80,0.08)",
                borderColor: "rgba(255,80,80,0.35)",
              }}
            >
              <p className="text-[0.9rem] font-bold mb-1">
                ⚠️ Cette page tourne uniquement en local
              </p>
              <p className="text-[0.85rem] text-white/65 leading-relaxed">
                Vercel ne supporte pas Python ni l&apos;écriture sur le disque.
                Lance{" "}
                <code
                  className="px-2 py-0.5 rounded bg-black/40 font-mono text-[0.85rem]"
                >
                  npm run dev
                </code>{" "}
                sur ton Mac, puis ouvre{" "}
                <code
                  className="px-2 py-0.5 rounded bg-black/40 font-mono text-[0.85rem]"
                >
                  http://localhost:3000/admin/photos
                </code>
                .
              </p>
            </div>
          )}
        </div>

        <PhotoAdmin
          products={products}
          disabled={isVercel}
          existingPreviews={existingPreviews}
          existingReferences={existingReferences}
          existingPublished={existingPublished}
        />
      </div>
    </div>
  );
}
