/**
 * Enriched inventory reader for the admin dashboard.
 *
 * Combines two sources:
 *  1. Public /products.json (no auth) — always available, gives us the
 *     `available` boolean and the current price per variant.
 *  2. Shopify Admin GraphQL (needs SHOPIFY_ADMIN_TOKEN) — adds the actual
 *     `inventoryQuantity`, SKU, and product-admin-URL so we can render
 *     "12 in stock" and a deep-link to Shopify Admin.
 *
 * Design decisions:
 *  - Both sources are called in parallel and merged. If the Admin call fails
 *    or the token is missing, we still return public data — the admin still
 *    works, we just can't show a quantity number.
 *  - Results are cached 60s. Admin cadence is fine, prevents burst calls.
 *  - Never throws: a broken Shopify returns an empty map, the UI degrades
 *    gracefully with "stock indisponible".
 */

import { unstable_cache } from "next/cache";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "y823wg-nz.myshopify.com";
const ADMIN_TOKEN  = process.env.SHOPIFY_ADMIN_TOKEN ?? "";
const API_VERSION  = process.env.SHOPIFY_API_VERSION ?? "2024-07";
const REVALIDATE_SECONDS = 60;

export type VariantInventory = {
  variantId: string;
  /** true = in stock (either quantity > 0 or Shopify says available) */
  available: boolean;
  /** live count from Admin API; null when only public data is available */
  quantity: number | null;
  /** Shopify unit price on the variant (string, e.g. "99.00") */
  price: string | null;
  /** admin URL to the parent product (null when no admin token) */
  adminProductUrl: string | null;
  /** Shopify product handle for open-in-shop links */
  productHandle: string | null;
  /** Shopify product title (from admin API) */
  productTitle: string | null;
  /** SKU when present */
  sku: string | null;
};

export type InventorySnapshot = {
  /** ISO timestamp of the fetch that populated this map */
  fetchedAt: string;
  /** true if the Admin API augmentation succeeded (quantities present) */
  hasAdminData: boolean;
  /** keyed by variantId (string) */
  variants: Record<string, VariantInventory>;
};

/* ── Public products.json (no auth) ──────────────────────────── */

type PublicVariant = {
  id: number;
  available: boolean;
  price: string;
  sku: string | null;
};
type PublicProduct = { id: number; handle: string; title: string; variants: PublicVariant[] };
type PublicJson = { products: PublicProduct[] };

async function fetchPublicInventory(): Promise<Record<string, VariantInventory>> {
  try {
    const res = await fetch(
      `https://${STORE_DOMAIN}/products.json?limit=250`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) {
      console.warn("[shopify-admin-inventory] public HTTP", res.status);
      return {};
    }
    const json = (await res.json()) as PublicJson;
    const out: Record<string, VariantInventory> = {};
    for (const p of json.products ?? []) {
      for (const v of p.variants ?? []) {
        out[String(v.id)] = {
          variantId: String(v.id),
          available: Boolean(v.available),
          quantity: null,
          price: v.price ?? null,
          adminProductUrl: null,
          productHandle: p.handle ?? null,
          productTitle: p.title ?? null,
          sku: v.sku ?? null,
        };
      }
    }
    return out;
  } catch (err) {
    console.warn("[shopify-admin-inventory] public fetch failed", err);
    return {};
  }
}

/* ── Admin GraphQL (needs token) ─────────────────────────────── */

type AdminVariantNode = {
  id: string;
  sku: string | null;
  inventoryQuantity: number | null;
  price: string;
  product: { id: string; handle: string; title: string } | null;
};
type AdminResponse = {
  data?: {
    productVariants: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: AdminVariantNode[];
    };
  };
  errors?: { message: string }[];
};

const ADMIN_QUERY = /* GraphQL */ `
  query AllVariants($after: String) {
    productVariants(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id sku inventoryQuantity price
        product { id handle title }
      }
    }
  }
`;

/** Strip "gid://shopify/ProductVariant/1234" → "1234" so callers can match by
 *  the same numeric string the rest of the app uses. */
function variantIdFromGid(gid: string): string {
  const m = gid.match(/\/(\d+)$/);
  return m ? m[1] : gid;
}
function productIdFromGid(gid: string): string {
  const m = gid.match(/\/(\d+)$/);
  return m ? m[1] : gid;
}

async function fetchAdminInventory(): Promise<Record<string, Partial<VariantInventory>> | null> {
  if (!ADMIN_TOKEN) return null;
  const endpoint = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
  const out: Record<string, Partial<VariantInventory>> = {};
  let cursor: string | null = null;
  /** Cap the pagination just in case something goes wrong — 250 * 20 = 5000
   *  variants, way more than any real catalogue we'd ever have. */
  for (let page = 0; page < 20; page++) {
    let json: AdminResponse;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ query: ADMIN_QUERY, variables: { after: cursor } }),
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) {
        console.warn("[shopify-admin-inventory] admin HTTP", res.status, res.statusText);
        return page === 0 ? null : out;
      }
      json = (await res.json()) as AdminResponse;
    } catch (err) {
      console.warn("[shopify-admin-inventory] admin fetch failed", err);
      return page === 0 ? null : out;
    }

    if (json.errors?.length) {
      console.warn("[shopify-admin-inventory] admin errors:", json.errors.map((e) => e.message).join("; "));
      return page === 0 ? null : out;
    }

    const nodes = json.data?.productVariants?.nodes ?? [];
    for (const n of nodes) {
      const vid = variantIdFromGid(n.id);
      const productAdminUrl = n.product
        ? `https://${STORE_DOMAIN.replace(".myshopify.com", "")}.myshopify.com/admin/products/${productIdFromGid(n.product.id)}`
        : null;
      out[vid] = {
        variantId: vid,
        quantity: typeof n.inventoryQuantity === "number" ? n.inventoryQuantity : null,
        price: n.price ?? null,
        sku: n.sku ?? null,
        adminProductUrl: productAdminUrl,
        productHandle: n.product?.handle ?? null,
        productTitle: n.product?.title ?? null,
      };
    }

    const page_info = json.data?.productVariants?.pageInfo;
    if (!page_info?.hasNextPage) break;
    cursor = page_info.endCursor;
  }
  return out;
}

/* ── Merged snapshot (cached) ────────────────────────────────── */

async function buildSnapshotFresh(): Promise<InventorySnapshot> {
  const [publicMap, adminMap] = await Promise.all([
    fetchPublicInventory(),
    fetchAdminInventory(),
  ]);
  const merged: Record<string, VariantInventory> = { ...publicMap };
  if (adminMap) {
    for (const [vid, extra] of Object.entries(adminMap)) {
      const base = merged[vid] ?? {
        variantId: vid,
        available: (extra.quantity ?? 0) > 0,
        quantity: null,
        price: null,
        adminProductUrl: null,
        productHandle: null,
        productTitle: null,
        sku: null,
      };
      merged[vid] = { ...base, ...extra, available: base.available };
      // If we have a quantity, prefer it over the public boolean when it says 0
      if (typeof extra.quantity === "number") {
        merged[vid].available = extra.quantity > 0 || base.available;
      }
    }
  }
  return {
    fetchedAt: new Date().toISOString(),
    hasAdminData: adminMap !== null,
    variants: merged,
  };
}

export const INVENTORY_ADMIN_TAG = "shopify-admin-inventory";

export const getInventorySnapshot = unstable_cache(
  buildSnapshotFresh,
  ["shopify-admin-inventory-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: [INVENTORY_ADMIN_TAG] },
);
