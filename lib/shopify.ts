const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "y823wg-nz.myshopify.com";
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2024-07";
const PUBLIC_DOMAIN = process.env.SHOPIFY_PUBLIC_DOMAIN ?? "airplanestore.fr";

export const DISCOUNT_CODE = "TAKEOFF10";

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
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
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
      id
      handle
      title
      description
      featuredImage { url altText }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 10) { nodes { id availableForSale title } }
    }
  }
`;

export async function fetchShopifyProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(PRODUCT_BY_HANDLE, {
    handle,
  });
  return data?.product ?? null;
}
