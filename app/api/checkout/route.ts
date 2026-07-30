import { NextRequest, NextResponse } from "next/server";
import { createCartCheckoutUrl, checkoutUrl } from "@/lib/shopify";

export const runtime = "edge";

type Body = {
  items: {
    variantId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[];
  discount?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { items, discount } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items required" }, { status: 400 });
    }

    // Reject placeholder variants — "0" means the product isn't wired to a
    // real Shopify variant yet. Sending it to /cart would break the Shopify
    // checkout with an unhelpful error page.
    const badItem = items.find((it) => !it.variantId || it.variantId === "0" || !/^\d{10,20}$/.test(it.variantId));
    if (badItem) {
      return NextResponse.json(
        {
          error: "invalid_variant",
          userMessage:
            "Ce produit n'est pas encore disponible à l'achat en ligne. Contactez-nous pour un devis.",
        },
        { status: 400 },
      );
    }

    // Try Storefront API first (requires SHOPIFY_STOREFRONT_TOKEN)
    const apiUrl = await createCartCheckoutUrl(items, discount ?? null);
    if (apiUrl) {
      return NextResponse.json({ url: apiUrl });
    }

    // Fallback: cart permalink (always works, no token needed)
    const fallback = checkoutUrl(items, discount ?? null);
    return NextResponse.json({ url: fallback });

  } catch (err) {
    console.error("[checkout/route]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
