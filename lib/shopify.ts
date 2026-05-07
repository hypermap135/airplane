const STORE_DOMAIN  = process.env.SHOPIFY_STORE_DOMAIN   ?? "y823wg-nz.myshopify.com";
const TOKEN         = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";
const API_VERSION   = process.env.SHOPIFY_API_VERSION      ?? "2024-07";

// PUBLIC_DOMAIN: domain that serves Shopify cart/checkout for the customer.
// Defaults to STORE_DOMAIN (the *.myshopify.com store) — this is what works out
// of the box. Override with SHOPIFY_PUBLIC_DOMAIN ONLY if Shopify is configured
// to serve a custom subdomain (e.g. shop.airplanestore.fr). Do NOT set this to
// the same domain as the Next.js site (e.g. airplanestore.fr) — Vercel doesn't
// serve /cart or /checkouts paths and the redirect will land on a 404.
const PUBLIC_DOMAIN = process.env.SHOPIFY_PUBLIC_DOMAIN ?? STORE_DOMAIN;

export const DISCOUNT_CODE = "TAKEOFF10";

// ─── Cart permalink fallback (no token needed) ────────────────────────────────
// Goes directly to the Shopify-hosted cart page. Shopify will then forward to
// /checkouts/cn/... once the customer clicks "Checkout".
export function checkoutUrl(
  items: { variantId: string; quantity: number }[],
  discount?: string | null,
): string {
  const parts = items
    .filter((i) => i.quantity > 0)
    .map((i) => `${i.variantId}:${i.quantity}`)
    .join(",");
  const qs = discount ? `?discount=${encodeURIComponent(discount)}` : "";
  return `https://${PUBLIC_DOMAIN}/cart/${parts}${qs}`;
}

// ─── Storefront API (requires SHOPIFY_STOREFRONT_TOKEN) ───────────────────────
type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  if (!TOKEN) return null;
  const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.warn("[shopify] HTTP", res.status, res.statusText);
      return null;
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      console.warn("[shopify]", json.errors.map((e) => e.message).join("; "));
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.warn("[shopify] fetch failed", err);
    return null;
  }
}

// ─── Cart creation mutation ───────────────────────────────────────────────────
const CART_CREATE = /* GraphQL */ `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type CartCreateData = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: { field: string; message: string }[];
  };
};

function toGid(variantId: string): string {
  if (variantId.startsWith("gid://")) return variantId;
  return `gid://shopify/ProductVariant/${variantId}`;
}

export async function createCartCheckoutUrl(
  items: { variantId: string; quantity: number }[],
  discount?: string | null,
): Promise<string | null> {
  const lines = items
    .filter((i) => i.quantity > 0)
    .map((i) => ({ merchandiseId: toGid(i.variantId), quantity: i.quantity }));

  const input: Record<string, unknown> = { lines };
  if (discount) input.discountCodes = [discount];

  const data = await shopifyFetch<CartCreateData>(CART_CREATE, { input });
  if (data?.cartCreate?.userErrors?.length) {
    console.warn("[shopify] cartCreate errors:", data.cartCreate.userErrors);
  }
  return data?.cartCreate?.cart?.checkoutUrl ?? null;
}

// ─── Product query (optional, for real-time data) ────────────────────────────
export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { nodes: { id: string; availableForSale: boolean; title: string }[] };
};

const PRODUCT_BY_HANDLE = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id handle title description
      featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 10) { nodes { id availableForSale title } }
    }
  }
`;

export async function fetchShopifyProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(PRODUCT_BY_HANDLE, { handle });
  return data?.product ?? null;
}
