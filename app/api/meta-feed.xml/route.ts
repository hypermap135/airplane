/**
 * Meta Commerce Catalog feed (RSS 2.0 / Google Merchant compatible).
 * Meta polls this URL on schedule (hourly recommended) to ingest the
 * 30+ products into the catalog. Used by Dynamic Product Ads, Catalog
 * Sales objective, and Advantage+ Shopping campaigns.
 *
 * Spec:
 *   https://www.facebook.com/business/help/120325381656392
 *
 * URL on prod: https://airplanestore.fr/api/meta-feed.xml
 */

import { NextResponse } from "next/server";
import { formatPrice } from "@/lib/products";
import { getProducts } from "@/lib/products-store";

// Node runtime (not edge) so we can import @vercel/blob inside products-store.
export const runtime = "nodejs";
export const revalidate = 3600; // cache 1h

const SITE = "https://airplanestore.fr";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${SITE}${path}`;
  return `${SITE}/${path}`;
}

function brandFromCollection(collection: string): string {
  switch (collection) {
    case "airbus":
      return "Airbus";
    case "boeing":
      return "Boeing";
    case "concorde":
      return "Concorde";
    case "jet":
      return "Gulfstream";
    default:
      return "Airplanestore";
  }
}

export async function GET(): Promise<NextResponse> {
  const PRODUCTS = await getProducts();
  const items = PRODUCTS
    // Skip pure placeholders without a real variantId
    .filter((p) => p.variantId !== "0" || p.comingSoon)
    .map((p) => {
      const link = `${SITE}/products/${p.handle}`;
      const imageLink = absUrl(p.image);
      const additionalImages = (p.images ?? [])
        .filter((img) => img !== p.image)
        .slice(0, 9)
        .map((img) => `<g:additional_image_link>${escapeXml(absUrl(img))}</g:additional_image_link>`)
        .join("");
      const availability = p.inStock ? "in stock" : "out of stock";
      const price = `${p.price.toFixed(2)} EUR`;
      const compareAt = p.compareAt ? `<g:sale_price>${p.price.toFixed(2)} EUR</g:sale_price>` : "";
      const description = p.subtitle
        ? `${p.title}. ${p.subtitle}. Maquette en résine monobloc, peinture main, LED intégrée. Échelle ${p.scale ?? "1/100"}. Livraison France & Europe.`
        : `${p.title}. Maquette en résine monobloc, peinture main. Échelle ${p.scale ?? "1/100"}.`;

      return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>${additionalImages}
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      ${p.compareAt ? `<g:compare_at_price>${p.compareAt.toFixed(2)} EUR</g:compare_at_price>${compareAt}` : ""}
      <g:brand>${escapeXml(brandFromCollection(p.collection))}</g:brand>
      <g:product_type>${escapeXml(p.collection)}</g:product_type>
      <g:google_product_category>54</g:google_product_category>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:item_group_id>${escapeXml(p.collection)}</g:item_group_id>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>AirplaneStore — Maquettes premium</title>
    <link>${SITE}</link>
    <description>Catalogue des maquettes d'avion en résine premium · Air France · Boeing · Airbus · Concorde · Jet privé.</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
    },
  });
}
