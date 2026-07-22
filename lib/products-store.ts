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

import { unstable_cache, revalidateTag } from "next/cache";
import { PRODUCTS, type Product, type ProductSpec, type Collection } from "@/lib/products";
import { getShopifyInventory } from "@/lib/shopify-inventory";

const BLOB_OVERRIDES_KEY = "products-overrides.json";
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
}>;

export type OverridesMap = Record<string, ProductOverride>;

/** Fetch the overrides JSON from Vercel Blob. Empty object if absent. */
async function fetchOverridesFresh(): Promise<OverridesMap> {
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_OVERRIDES_KEY });
    const match = blobs.find((b) => b.pathname === BLOB_OVERRIDES_KEY);
    if (!match) return {};

    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return {};
    return (await res.json()) as OverridesMap;
  } catch (err) {
    // Blob may be unconfigured in dev — log once, return empty so the
    // base catalogue still renders.
    console.warn("[products-store] overrides fetch failed:", err);
    return {};
  }
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

/** Public: full catalogue with overrides + Shopify inventory applied; hidden dropped. */
export async function getProducts(): Promise<Product[]> {
  const [overrides, inventory] = await Promise.all([
    getOverridesCached(),
    getShopifyInventory(),
  ]);
  return PRODUCTS
    .filter((p) => !(overrides[p.id]?.hidden === true))
    .map((p) => applyOverride(p, overrides[p.id]))
    .map((p) => applyShopifyInventory(p, inventory, overrides[p.id]?.inStock));
}

/** Public: same as `getProducts` but does not drop hidden products — for /admin only. */
export async function getProductsAdmin(): Promise<Array<Product & { hidden?: boolean }>> {
  const [overrides, inventory] = await Promise.all([
    getOverridesCached(),
    getShopifyInventory(),
  ]);
  return PRODUCTS.map((p) => {
    const withOv = applyOverride(p, overrides[p.id]);
    const final = applyShopifyInventory(withOv, inventory, overrides[p.id]?.inStock);
    return { ...final, hidden: overrides[p.id]?.hidden === true };
  });
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

/** Admin: replace the entire overrides map and revalidate the site. */
export async function writeOverrides(next: OverridesMap): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(BLOB_OVERRIDES_KEY, JSON.stringify(next, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
  revalidateTag(PRODUCTS_TAG);
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
