import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { PRODUCTS } from "@/lib/products";
import {
  getInventorySnapshot,
  INVENTORY_ADMIN_TAG,
} from "@/lib/shopify-admin-inventory";

/**
 * Push prices from lib/products.ts → Shopify.
 *
 * The site displays prices from `PRODUCTS` (source of truth). Shopify holds
 * its own copy on each variant. This route reconciles the two.
 *
 * GET  ?dry=1  → returns the diff (what WOULD change), doesn't call Shopify
 * POST         → applies the changes via productVariantsBulkUpdate
 *
 * Requires SHOPIFY_ADMIN_TOKEN to write. Without it the dry-run still works,
 * and POST returns 501 with a clear message. Admin-gated by middleware.
 */

export const dynamic = "force-dynamic";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "y823wg-nz.myshopify.com";
const ADMIN_TOKEN  = process.env.SHOPIFY_ADMIN_TOKEN ?? "";
const API_VERSION  = process.env.SHOPIFY_API_VERSION ?? "2024-07";

type PlannedChange = {
  variantId: string;
  handle: string;
  title: string;
  currentShopifyPrice: number | null;
  targetPrice: number;
};

type Report = {
  needsToken: boolean;
  planned: PlannedChange[];
  skippedNoVariant: { handle: string; title: string }[];
  skippedMissing: { handle: string; title: string; variantId: string }[];
  applied?: { variantId: string; ok: boolean; error?: string }[];
};

async function buildPlan(): Promise<Report> {
  const inventory = await getInventorySnapshot();
  const planned: PlannedChange[] = [];
  const skippedNoVariant: { handle: string; title: string }[] = [];
  const skippedMissing: { handle: string; title: string; variantId: string }[] = [];

  for (const p of PRODUCTS) {
    if (!p.variantId || p.variantId === "0") {
      skippedNoVariant.push({ handle: p.handle, title: p.title });
      continue;
    }
    const inv = inventory.variants[p.variantId];
    if (!inv) {
      skippedMissing.push({ handle: p.handle, title: p.title, variantId: p.variantId });
      continue;
    }
    const shopifyPrice = inv.price != null ? parseFloat(inv.price) : null;
    // Consider a change needed if the two floats differ by more than 1 cent.
    if (shopifyPrice == null || Math.abs(shopifyPrice - p.price) > 0.01) {
      planned.push({
        variantId: p.variantId,
        handle: p.handle,
        title: p.title,
        currentShopifyPrice: shopifyPrice,
        targetPrice: p.price,
      });
    }
  }

  return {
    needsToken: !ADMIN_TOKEN,
    planned,
    skippedNoVariant,
    skippedMissing,
  };
}

export async function GET() {
  try {
    const report = await buildPlan();
    return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return NextResponse.json(
      { error: String((err as Error)?.message ?? err) },
      { status: 500 },
    );
  }
}

/* ── Shopify Admin GraphQL mutation ───────────────────────────
 *
 * productVariantsBulkUpdate expects a productId + a list of variants under
 * that product. Since we drive updates by variantId regardless of product,
 * we need to know which product each variant belongs to. We already have
 * this info in the InventorySnapshot (adminProductUrl was derived from the
 * product's Admin GID). We don't stash the GID directly though — easier to
 * just look them up ourselves before the mutation with a single query per
 * batch.
 */

type BulkUpdateResp = {
  data?: {
    productVariantsBulkUpdate: {
      userErrors: { field: string[]; message: string }[];
      productVariants: { id: string; price: string }[];
    };
  };
  errors?: { message: string }[];
};

const BULK_UPDATE = /* GraphQL */ `
  mutation Sync($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      userErrors { field message }
      productVariants { id price }
    }
  }
`;

const VARIANT_LOOKUP = /* GraphQL */ `
  query LookupProducts($ids: [ID!]!) {
    nodes(ids: $ids) { ... on ProductVariant { id product { id } } }
  }
`;

type VariantNode = { id: string; product: { id: string } | null } | null;

async function adminFetch<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  const endpoint = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify Admin HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function POST() {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json(
        {
          error:
            "SHOPIFY_ADMIN_TOKEN manquant. Ajoute-le dans les env vars Vercel avec les scopes write_products (Shopify Admin → Apps → develop apps → API access token) pour activer la synchro.",
          needsToken: true,
        },
        { status: 501 },
      );
    }

    const plan = await buildPlan();
    if (plan.planned.length === 0) {
      return NextResponse.json({ ...plan, applied: [] });
    }

    // 1. Look up productId for each variantId in one shot.
    const variantGids = plan.planned.map((p) => `gid://shopify/ProductVariant/${p.variantId}`);
    const lookup = await adminFetch<{ data?: { nodes: VariantNode[] }; errors?: { message: string }[] }>(
      VARIANT_LOOKUP,
      { ids: variantGids },
    );
    if (lookup?.errors?.length) {
      return NextResponse.json(
        { error: lookup.errors.map((e) => e.message).join("; ") },
        { status: 502 },
      );
    }
    const productByVariant: Record<string, string> = {};
    for (const node of lookup?.data?.nodes ?? []) {
      if (node?.id && node.product?.id) {
        productByVariant[node.id] = node.product.id;
      }
    }

    // 2. Group updates by productId (Shopify's mutation shape).
    const byProduct: Record<string, { variantId: string; price: string }[]> = {};
    const applied: { variantId: string; ok: boolean; error?: string }[] = [];
    for (const change of plan.planned) {
      const variantGid = `gid://shopify/ProductVariant/${change.variantId}`;
      const productGid = productByVariant[variantGid];
      if (!productGid) {
        applied.push({
          variantId: change.variantId,
          ok: false,
          error: "Impossible de trouver le productId Shopify",
        });
        continue;
      }
      (byProduct[productGid] ??= []).push({
        variantId: variantGid,
        price: change.targetPrice.toFixed(2),
      });
    }

    // 3. Fire one bulk-update per productId. Serial so we stay under the
    //    250-cost/minute admin budget without any custom throttling.
    for (const [productGid, variants] of Object.entries(byProduct)) {
      try {
        const resp = await adminFetch<BulkUpdateResp>(BULK_UPDATE, {
          productId: productGid,
          variants: variants.map((v) => ({ id: v.variantId, price: v.price })),
        });
        const gqlErrs = resp?.errors ?? [];
        const userErrs = resp?.data?.productVariantsBulkUpdate?.userErrors ?? [];
        if (gqlErrs.length || userErrs.length) {
          const msg = [...gqlErrs.map((e) => e.message), ...userErrs.map((e) => e.message)].join("; ");
          for (const v of variants) {
            applied.push({ variantId: stripGid(v.variantId), ok: false, error: msg });
          }
        } else {
          for (const v of variants) {
            applied.push({ variantId: stripGid(v.variantId), ok: true });
          }
        }
      } catch (err) {
        const msg = String((err as Error)?.message ?? err);
        for (const v of variants) {
          applied.push({ variantId: stripGid(v.variantId), ok: false, error: msg });
        }
      }
    }

    // 4. Bust the inventory cache so the admin dashboard shows the new prices
    //    on the next tick.
    revalidateTag(INVENTORY_ADMIN_TAG);

    return NextResponse.json({ ...plan, applied });
  } catch (err) {
    return NextResponse.json(
      { error: String((err as Error)?.message ?? err) },
      { status: 500 },
    );
  }
}

function stripGid(gid: string): string {
  const m = gid.match(/\/(\d+)$/);
  return m ? m[1] : gid;
}
