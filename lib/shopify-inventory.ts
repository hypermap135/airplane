/**
 * Shopify inventory sync via the public products.json endpoint.
 *
 * No token needed — Shopify serves products.json on every store's public
 * origin. We fetch the whole catalogue, extract each variant's `available`
 * flag, and return a Map keyed by variant id (string).
 *
 * Cached for 5 minutes via unstable_cache so the site doesn't hammer
 * Shopify. When the client toggles inventory in Shopify Admin, the site
 * catches up within 5 min automatically — good enough to prevent orders
 * on out-of-stock items without a webhook infra.
 */

import { unstable_cache } from "next/cache";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "y823wg-nz.myshopify.com";
const REVALIDATE_SECONDS = 300; // 5 min
export const INVENTORY_TAG = "shopify-inventory";

type ShopifyVariant = { id: number; available: boolean };
type ShopifyProduct = { id: number; handle: string; variants: ShopifyVariant[] };
type ProductsJson = { products: ShopifyProduct[] };

/** Fetch the full public catalogue and return a Map<variantId, available>. */
async function fetchInventoryFresh(): Promise<Record<string, boolean>> {
  try {
    const res = await fetch(
      `https://${STORE_DOMAIN}/products.json?limit=250`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) {
      console.warn("[shopify-inventory] HTTP", res.status);
      return {};
    }
    const json = (await res.json()) as ProductsJson;
    const map: Record<string, boolean> = {};
    for (const p of json.products ?? []) {
      for (const v of p.variants ?? []) {
        map[String(v.id)] = v.available;
      }
    }
    return map;
  } catch (err) {
    console.warn("[shopify-inventory] fetch failed:", err);
    return {};
  }
}

/** Cached inventory reader. */
export const getShopifyInventory = unstable_cache(
  fetchInventoryFresh,
  ["shopify-inventory-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: [INVENTORY_TAG] },
);
