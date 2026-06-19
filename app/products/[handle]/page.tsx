import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { PRODUCTS, type Product } from "@/lib/products";
import { getProductByHandle } from "@/lib/products-store";

const BASE = "https://airplanestore.fr";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  if (!product) return { title: "Produit" };

  // Rich description for Google snippets — includes price + key selling
  // points so the result line on SERP reads as a real product, not boilerplate.
  const desc =
    `${product.subtitle ?? "Maquette d'avion en résine premium."} ` +
    `${product.scale ?? ""} · ${product.price}€ · LED intégré · Fait en France.`;

  // Resolve image URL — if it's already absolute (CDN) leave it, otherwise
  // prefix with the site origin so Google / OG crawlers can fetch it.
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${BASE}${product.image}`;

  return {
    title: product.title,
    description: desc.trim(),
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title: `${product.title} · AirplaneStore`,
      description: desc.trim(),
      url: `${BASE}/products/${product.handle}`,
      type: "website",
      images: [{ url: imageUrl, alt: product.title, width: 1200, height: 1200 }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: desc.trim(),
      images: [imageUrl],
    },
  };
}

/** Build JSON-LD for a single product. */
function productLd(product: Product) {
  const imageUrl = product.image.startsWith("http")
    ? product.image
    : `${BASE}${product.image}`;
  const url = `${BASE}/products/${product.handle}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.subtitle ?? "Maquette d'avion en résine premium, fait en France.",
    image: imageUrl,
    sku: product.id,
    mpn: product.variantId,
    brand: {
      "@type": "Brand",
      name: "AirplaneStore",
    },
    category: product.collection,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      ...(product.compareAt && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: product.price.toFixed(2),
          priceCurrency: "EUR",
        },
      }),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : product.comingSoon
          ? "https://schema.org/PreOrder"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "AirplaneStore" },
      areaServed: ["FR", "BE", "CH", "LU", "EU"],
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        applicableCountry: "FR",
      },
    },
    // aggregateRating intentionally omitted until real customer reviews
    // are wired in — Google penalises sites that emit fabricated review
    // data, even if the visible UI shows placeholder stars.
  };
}

/** Breadcrumb so SERP can show "Home › Collection › Product". */
function breadcrumbLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: BASE },
      {
        "@type": "ListItem",
        position: 2,
        name: product.collection.charAt(0).toUpperCase() + product.collection.slice(1),
        item: `${BASE}/collections/${product.collection}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${BASE}/products/${product.handle}`,
      },
    ],
  };
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await getProductByHandle(params.handle);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(product)) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
