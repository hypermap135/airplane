/**
 * POST /api/admin/setup-keychain-variants
 *
 * One-shot setup: creates 7 Shopify products (one per keychain design)
 * at 4,90 € each so the visible Next.js catalog has real variants to
 * sell. Idempotent — re-running won't duplicate products that already
 * exist (matched by handle).
 *
 * Protected by the admin session cookie (handled in middleware.ts).
 *
 * Response:
 *   {
 *     ok: true,
 *     created: number,
 *     skipped: number,
 *     mapping: Record<handle, variantId>  // for products.ts update
 *   }
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const STORE   = "y823wg-nz.myshopify.com";
const API_VER = "2024-07";
const GQL_URL = `https://${STORE}/admin/api/${API_VER}/graphql.json`;

/** The 7 keychains that need a Shopify variant. */
const KEYCHAINS = [
  { handle: "porte-cle-remove-before-flight",   title: "Porte-clé REMOVE BEFORE FLIGHT",        image: "porte-cle-remove-before-flight.png" },
  { handle: "porte-cle-air-france-navy",        title: "Porte-clé AIR FRANCE Navy",             image: "porte-cle-air-france-navy.png" },
  { handle: "porte-cle-air-france-rouge-navy",  title: "Porte-clé AIR FRANCE Rouge & Navy",     image: "porte-cle-air-france-rouge-navy.png" },
  { handle: "porte-cle-captain",                title: "Porte-clé CAPTAIN",                     image: "porte-cle-captain.png" },
  { handle: "porte-cle-pilot",                  title: "Porte-clé PILOT",                       image: "porte-cle-pilot.png" },
  { handle: "porte-cle-silhouette-avion-1",     title: "Porte-clé Silhouette Avion (jaune)",    image: "porte-cle-silhouette-avion-1.png" },
  { handle: "porte-cle-silhouette-avion-2",     title: "Porte-clé Silhouette Avion (constellation)", image: "porte-cle-silhouette-avion-2.png" },
];

const PRICE = "4.90";

async function shopify<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) throw new Error("SHOPIFY_ADMIN_TOKEN not set");
  const res = await fetch(GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json() as { data?: T; errors?: unknown[] };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return (json.data ?? {}) as T;
}

/** Look up an existing product by handle to make this route idempotent. */
async function findByHandle(handle: string): Promise<{ id: string; variantId: string } | null> {
  const data = await shopify<{
    productByHandle: {
      id: string;
      variants: { edges: { node: { id: string } }[] };
    } | null;
  }>(
    `query($handle: String!) {
      productByHandle(handle: $handle) {
        id
        variants(first: 1) { edges { node { id } } }
      }
    }`,
    { handle }
  );
  if (!data.productByHandle) return null;
  const variantId = data.productByHandle.variants.edges[0]?.node?.id;
  if (!variantId) return null;
  return {
    id: data.productByHandle.id,
    variantId,
  };
}

/** Create a brand new product with one default variant priced at 4,90 €. */
async function createProduct(handle: string, title: string): Promise<{ id: string; variantId: string }> {
  // 1. Create product
  const created = await shopify<{
    productCreate: {
      product: {
        id: string;
        variants: { edges: { node: { id: string } }[] };
      };
      userErrors: { field: string[]; message: string }[];
    };
  }>(
    `mutation($product: ProductInput!) {
      productCreate(product: $product) {
        product {
          id
          variants(first: 1) { edges { node { id } } }
        }
        userErrors { field message }
      }
    }`,
    {
      product: {
        title,
        handle,
        descriptionHtml:
          `<p>${title} — tissu brodé, double-face, fermoir métal. Idéal sac, ` +
          `clés ou trousseau crew. <strong>4,90 €</strong>.</p>`,
        status: "ACTIVE",
        tags: ["accessoires", "porte-cle"],
        productType: "Accessoire",
      },
    }
  );

  const errs = created.productCreate.userErrors;
  if (errs.length > 0) throw new Error(`productCreate ${handle}: ${JSON.stringify(errs)}`);

  const productId = created.productCreate.product.id;
  const variantId = created.productCreate.product.variants.edges[0]?.node?.id;
  if (!variantId) throw new Error(`No variant created for ${handle}`);

  // 2. Set the variant price (productCreate doesn't accept price directly
  //    on the default variant in newer API versions)
  const priced = await shopify<{
    productVariantsBulkUpdate: {
      userErrors: { field: string[]; message: string }[];
    };
  }>(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`,
    {
      productId,
      variants: [{ id: variantId, price: PRICE }],
    }
  );

  const priceErrs = priced.productVariantsBulkUpdate.userErrors;
  if (priceErrs.length > 0) throw new Error(`priceUpdate ${handle}: ${JSON.stringify(priceErrs)}`);

  return { id: productId, variantId };
}

/** Strip the `gid://shopify/ProductVariant/` prefix → keep just the numeric ID
 *  so it matches the format already used in lib/products.ts. */
function extractNumericId(gid: string): string {
  const m = gid.match(/\/(\d+)$/);
  return m ? m[1] : gid;
}

export async function POST(_req: NextRequest) {
  const results: { handle: string; status: "created" | "exists" | "error"; variantId?: string; error?: string }[] = [];

  for (const kc of KEYCHAINS) {
    try {
      const existing = await findByHandle(kc.handle);
      if (existing) {
        results.push({
          handle: kc.handle,
          status: "exists",
          variantId: extractNumericId(existing.variantId),
        });
        continue;
      }
      const created = await createProduct(kc.handle, kc.title);
      results.push({
        handle: kc.handle,
        status: "created",
        variantId: extractNumericId(created.variantId),
      });
    } catch (err) {
      results.push({
        handle: kc.handle,
        status: "error",
        error: String(err),
      });
    }
  }

  const mapping: Record<string, string> = {};
  for (const r of results) if (r.variantId) mapping[r.handle] = r.variantId;

  return NextResponse.json({
    ok: results.every((r) => r.status !== "error"),
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "exists").length,
    errors:  results.filter((r) => r.status === "error").length,
    results,
    mapping,
  });
}
