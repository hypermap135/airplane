/**
 * Products store with Vercel Blob-backed overrides.
 *
 * - `PRODUCTS` in lib/products.ts stays as the static base catalogue.
 * - Admin edits are persisted as a single JSON file in Vercel Blob,
 *   keyed by product id. Only the fields the admin changed are stored.
 * - `getProducts()` / `getProduct()` merge the base + the overrides at read
 *   time so the rest of the site (server components) doesn't change shape.
 *
 * Tag-based revalidation: server reads cache for `REVALIDATE_SECONDS`,
 * but the admin PATCH route calls `revalidateTag(PRODUCTS_TAG)` so changes
 * appear within a few seconds without a redeploy.
 */

import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { PRODUCTS, type Product, type ProductSpec, type Collection } from "@/lib/products";
import { getShopifyInventory } from "@/lib/shopify-inventory";
import {
  isGitHubStorageConfigured,
  readJsonFromRepo,
  writeJsonToRepo,
  checkGitHubStorage,
} from "@/lib/github-storage";
import bundledOverrides from "@/data/products-overrides.json";

const OVERRIDES_REPO_PATH = "data/products-overrides.json";
const REVALIDATE_SECONDS = 30;
export const PRODUCTS_TAG = "products";

/** Subset of Product fields the admin is allowed to override. */
export type ProductOverride = Partial<{
  title: string;
  subtitle: string;
  price: number;
  compareAt: number | null;
  inStock: boolean;
  comingSoon: boolean;
  bestseller: boolean;
  image: string;
  images: string[];
  scale: string;
  collection: Collection;
  hidden: boolean; // soft-hide a product from the catalogue without deleting it
  specs: ProductSpec[];
  description: string;
  /** Index d'affichage dans les collections (0 = premier). Non défini → ordre naturel PRODUCTS[]. */
  sortOrder: number;
}>;

export type OverridesMap = Record<string, ProductOverride>;

/**
 * Fetch the overrides JSON.
 *
 * Strategy:
 *   1. If GITHUB_TOKEN is configured → fetch live from GitHub API (always
 *      returns the latest committed state, even before Vercel redeploys).
 *   2. Fallback → use the bundled `data/products-overrides.json` (baked
 *      into the build). Works even without any env var set.
 *
 * The bundled fallback matters : during a build, the GitHub API call may
 * fail (no token in build env), and we still want the previous overrides
 * to survive the redeploy.
 */
async function fetchOverridesFresh(): Promise<OverridesMap> {
  if (isGitHubStorageConfigured()) {
    try {
      const result = await readJsonFromRepo<OverridesMap>(OVERRIDES_REPO_PATH);
      if (result) return result.data;
      return {};
    } catch (err) {
      console.warn("[products-store] GitHub read failed, falling back to bundled:", err);
    }
  }
  // Bundled at build time via static import
  return (bundledOverrides as OverridesMap) ?? {};
}

/** Cached overrides reader — revalidates by tag from the admin PATCH route. */
const getOverridesCached = unstable_cache(
  fetchOverridesFresh,
  ["products-overrides"],
  { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_TAG] },
);

/** Merge the base product with its override (override wins per field). */
function applyOverride(base: Product, ov: ProductOverride | undefined): Product {
  if (!ov) return base;
  return {
    ...base,
    ...(ov.title !== undefined       ? { title: ov.title } : {}),
    ...(ov.subtitle !== undefined    ? { subtitle: ov.subtitle } : {}),
    ...(ov.price !== undefined       ? { price: ov.price } : {}),
    ...(ov.compareAt !== undefined   ? { compareAt: ov.compareAt ?? undefined } : {}),
    ...(ov.inStock !== undefined     ? { inStock: ov.inStock } : {}),
    ...(ov.comingSoon !== undefined  ? { comingSoon: ov.comingSoon } : {}),
    ...(ov.bestseller !== undefined  ? { bestseller: ov.bestseller } : {}),
    ...(ov.image !== undefined       ? { image: ov.image } : {}),
    ...(ov.images !== undefined      ? { images: ov.images } : {}),
    ...(ov.scale !== undefined       ? { scale: ov.scale } : {}),
    ...(ov.collection !== undefined  ? { collection: ov.collection } : {}),
    ...(ov.specs !== undefined       ? { specs: ov.specs } : {}),
    ...(ov.description !== undefined ? { description: ov.description } : {}),
  };
}

/**
 * Apply Shopify's live availability on top of the (base + admin override).
 *
 * Priority (from lowest to highest):
 *   1. PRODUCTS[i].inStock                — hardcoded default
 *   2. Shopify products.json `available`  — live inventory, wins over #1
 *   3. Admin override `inStock`           — explicit override, wins over all
 *
 * Skipped when variantId is "0" (placeholder — product not yet on Shopify).
 * `comingSoon` products stay `inStock: false` regardless of Shopify (a
 * pre-launched sku on Shopify shouldn't accidentally go live here).
 */
function applyShopifyInventory(
  p: Product,
  inventory: Record<string, boolean>,
  adminInStock: boolean | undefined,
): Product {
  // Admin explicit override always wins — merchant can force OFF even if
  // Shopify says available (e.g. paused sales, missing packaging, etc.).
  if (adminInStock !== undefined) return { ...p, inStock: adminInStock };
  if (p.comingSoon) return p;
  if (p.variantId === "0") return p;
  const shopifyAvailable = inventory[p.variantId];
  if (shopifyAvailable === undefined) return p;
  return { ...p, inStock: shopifyAvailable };
}

/** Tri par sortOrder (admin) → produits ordonnés en premier, puis les autres
 *  dans l'ordre naturel de PRODUCTS[]. Stable sort. */
function sortByOrder(list: Product[], overrides: OverridesMap): Product[] {
  return [...list].sort((a, b) => {
    const oa = overrides[a.id]?.sortOrder;
    const ob = overrides[b.id]?.sortOrder;
    if (oa === undefined && ob === undefined) return 0;
    if (oa === undefined) return 1;
    if (ob === undefined) return -1;
    return oa - ob;
  });
}

/** Public: full catalogue with overrides + Shopify inventory applied; hidden dropped. */
export async function getProducts(): Promise<Product[]> {
  const [overrides, inventory] = await Promise.all([
    getOverridesCached(),
    getShopifyInventory(),
  ]);
  const list = PRODUCTS
    .filter((p) => !(overrides[p.id]?.hidden === true))
    .map((p) => applyOverride(p, overrides[p.id]))
    .map((p) => applyShopifyInventory(p, inventory, overrides[p.id]?.inStock));
  return sortByOrder(list, overrides);
}

/** Public: same as `getProducts` but does not drop hidden products — for /admin only. */
export async function getProductsAdmin(): Promise<Array<Product & { hidden?: boolean }>> {
  const [overrides, inventory] = await Promise.all([
    getOverridesCached(),
    getShopifyInventory(),
  ]);
  const list = PRODUCTS.map((p) => {
    const withOv = applyOverride(p, overrides[p.id]);
    const final = applyShopifyInventory(withOv, inventory, overrides[p.id]?.inStock);
    return { ...final, hidden: overrides[p.id]?.hidden === true };
  });
  return sortByOrder(list, overrides) as Array<Product & { hidden?: boolean }>;
}

/** Public: single product by handle, with override applied (or undefined). */
export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.handle === handle);
}

/** Admin: read raw overrides (used by the edit form to prefill fields). */
export async function readOverrides(): Promise<OverridesMap> {
  return getOverridesCached();
}

/** Admin: probe if the storage is writable. Returns error message when down.
 *  Used by /admin dashboard to show a banner when save is broken. */
export async function checkBlobHealth(): Promise<{ ok: boolean; reason?: string }> {
  // Backwards-compat alias — kept so admin/page.tsx still works.
  return checkGitHubStorage();
}

/** Admin: replace the entire overrides map and revalidate the site.
 *
 *  IMPORTANT: `revalidateTag` invalidates the data cache used by
 *  `getOverridesCached`, but the /collections/[slug] and /products/[handle]
 *  pages are prerendered as STATIC HTML at build time. Without
 *  `revalidatePath`, the static HTML sticks around until the next deploy —
 *  which is exactly the "j'ai modifié dans l'admin mais rien change côté
 *  collection" bug the client reported.
 */
export async function writeOverrides(next: OverridesMap): Promise<void> {
  if (!isGitHubStorageConfigured()) {
    throw new Error(
      "GitHub storage not configured — set GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO env vars on Vercel",
    );
  }
  // Commit the new state to the repo. The push triggers Vercel's auto-deploy,
  // which rebuilds with the new bundled JSON. The change is live after ~1-2 min.
  const nowIso = new Date().toISOString();
  await writeJsonToRepo(
    OVERRIDES_REPO_PATH,
    next,
    `admin: update products-overrides (${nowIso})`,
  );
  // Tag revalidation still useful — for the current serverless functions that
  // are already running, the next read via `fetchOverridesFresh` will hit
  // GitHub API and see the fresh state without waiting for redeploy.
  revalidateTag(PRODUCTS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/collections/[collection]", "page");
  revalidatePath("/collections/all", "page");
  revalidatePath("/products/[handle]", "page");
  revalidatePath("/favoris", "page");
}

/** Admin: patch one product's override. Pass `null` for a field to clear it. */
export async function patchProductOverride(
  id: string,
  patch: ProductOverride,
): Promise<void> {
  const current = await readOverrides();
  const merged: ProductOverride = { ...(current[id] ?? {}) };

  for (const [k, v] of Object.entries(patch)) {
    if (v === null) {
      delete (merged as Record<string, unknown>)[k];
    } else {
      (merged as Record<string, unknown>)[k] = v;
    }
  }

  const next: OverridesMap = { ...current, [id]: merged };
  if (Object.keys(merged).length === 0) delete next[id];
  await writeOverrides(next);
}
