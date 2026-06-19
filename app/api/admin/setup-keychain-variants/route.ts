/**
 * POST /api/admin/setup-keychain-variants
 *
 * Turns the existing keychain product (the one behind variant
 * 53842722357588) into a multi-design product with 8 variants — one
 * per embroidered design at 4,90 € each. Idempotent — re-running won't
 * duplicate existing variants (matched by option1 value).
 *
 * Steps:
 *  1. Find the parent product of variant 53842722357588.
 *  2. Add (or rename) a single product option named "Modèle".
 *  3. Rename the existing variant to option1 = "AIR FRANCE SkyTeam".
 *  4. Bulk-create the 7 missing variants at 4,90 €.
 *  5. Return mapping { label → variantId } for products.ts.
 *
 * Protected by the admin session cookie (handled in middleware.ts).
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const STORE   = "y823wg-nz.myshopify.com";
const API_VER = "2024-07";
const GQL_URL = `https://${STORE}/admin/api/${API_VER}/graphql.json`;
const EXISTING_VARIANT_ID = "53842722357588";   // numeric — gid built below
const PRICE = "4.90";

const VARIANT_LABELS = [
  "AIR FRANCE SkyTeam",        // index 0 — the existing one
  "REMOVE BEFORE FLIGHT",
  "AIR FRANCE Navy",
  "AIR FRANCE Rouge & Navy",
  "CAPTAIN",
  "PILOT",
  "Silhouette Avion",
  "Silhouette Constellation",
];

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

const numericId = (gid: string): string => {
  const m = gid.match(/\/(\d+)$/);
  return m ? m[1] : gid;
};
const variantGid = (n: string) => `gid://shopify/ProductVariant/${n}`;

type VariantNode = {
  id: string;
  title: string;
  selectedOptions: { name: string; value: string }[];
};

export async function POST(_req: NextRequest) {
  // ── 1. Look up the parent product + its current variants/options ────
  const parent = await shopify<{
    productVariant: {
      product: {
        id: string;
        options: { id: string; name: string; values: string[] }[];
        variants: { edges: { node: VariantNode }[] };
      };
    } | null;
  }>(
    `query($id: ID!) {
      productVariant(id: $id) {
        product {
          id
          options { id name values }
          variants(first: 50) {
            edges { node { id title selectedOptions { name value } } }
          }
        }
      }
    }`,
    { id: variantGid(EXISTING_VARIANT_ID) }
  );

  if (!parent.productVariant) {
    return NextResponse.json(
      { ok: false, error: `Variant ${EXISTING_VARIANT_ID} not found in Shopify` },
      { status: 404 }
    );
  }

  const productId = parent.productVariant.product.id;
  const existingVariants = parent.productVariant.product.variants.edges.map((e) => e.node);
  const currentOption = parent.productVariant.product.options[0];

  // ── 2. Make sure the option is named "Modèle" ──────────────────────
  // If the default variant is still on "Default Title" / "Title", we
  // need to rename the option AND set option1 on the existing variant.
  // productUpdate handles both in one call.
  if (currentOption.name !== "Modèle") {
    await shopify<{ productUpdate: { userErrors: unknown[] } }>(
      `mutation($product: ProductInput!) {
        productUpdate(product: $product) {
          userErrors { field message }
        }
      }`,
      {
        product: {
          id: productId,
          options: ["Modèle"],
          variants: [
            {
              id: existingVariants[0].id,
              options: [VARIANT_LABELS[0]],
              price: PRICE,
            },
          ],
        },
      }
    );
  }

  // ── 3. Re-fetch to see what option1 values exist NOW (idempotent) ──
  const after = await shopify<{
    product: { variants: { edges: { node: VariantNode }[] } };
  }>(
    `query($id: ID!) {
      product(id: $id) {
        variants(first: 50) {
          edges { node { id title selectedOptions { name value } } }
        }
      }
    }`,
    { id: productId }
  );

  const existingLabels = new Set(
    after.product.variants.edges
      .map((e) => e.node.selectedOptions[0]?.value)
      .filter(Boolean)
  );

  // ── 4. Bulk-create only the labels that don't exist yet ────────────
  const toCreate = VARIANT_LABELS.slice(1).filter((l) => !existingLabels.has(l));

  if (toCreate.length > 0) {
    const created = await shopify<{
      productVariantsBulkCreate: {
        productVariants: { id: string; selectedOptions: { name: string; value: string }[] }[];
        userErrors: { field: string[]; message: string }[];
      };
    }>(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            selectedOptions { name value }
          }
          userErrors { field message }
        }
      }`,
      {
        productId,
        variants: toCreate.map((label) => ({
          options: [label],
          price: PRICE,
        })),
      }
    );

    const errs = created.productVariantsBulkCreate.userErrors;
    if (errs.length > 0) {
      return NextResponse.json(
        { ok: false, error: `bulkCreate: ${JSON.stringify(errs)}` },
        { status: 500 }
      );
    }
  }

  // ── 5. Build the mapping { label → variantId } from the final state ─
  const final = await shopify<{
    product: { variants: { edges: { node: VariantNode }[] } };
  }>(
    `query($id: ID!) {
      product(id: $id) {
        variants(first: 50) {
          edges { node { id title selectedOptions { name value } } }
        }
      }
    }`,
    { id: productId }
  );

  const mapping: Record<string, string> = {};
  for (const edge of final.product.variants.edges) {
    const label = edge.node.selectedOptions[0]?.value;
    if (label) mapping[label] = numericId(edge.node.id);
  }

  return NextResponse.json({
    ok: true,
    created: toCreate.length,
    skipped: existingLabels.size - 1,   // minus the renamed default
    mapping,
  });
}
