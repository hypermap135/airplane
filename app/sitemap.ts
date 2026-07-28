import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/products";
import { getProducts } from "@/lib/products-store";

const BASE = "https://airplanestore.fr";

/**
 * Sitemap exposed at /sitemap.xml — Next.js builds it automatically from
 * what we return here. Includes:
 *   - static pages (home, faq, contact, a-propos, cgv)
 *   - one entry per collection
 *   - one entry per product
 *
 * lastModified uses the build time so Google sees a fresh stamp every
 * deploy; changeFrequency / priority hint relative importance.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const PRODUCTS = await getProducts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/collections/all`, lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/faq`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,    lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/a-propos`,   lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/cgv`,                       lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/mentions-legales`,          lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/politique-confidentialite`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/cookies`,                   lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/livraison-retours`,         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${BASE}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((p) => {
    const imageUrl = p.image.startsWith("http") ? p.image : `${BASE}${p.image}`;
    return {
      url: `${BASE}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      // In-stock + bestseller get the highest product priority, then in-stock,
      // then coming-soon, then everything else.
      priority: !p.inStock
        ? 0.5
        : p.bestseller
          ? 0.9
          : 0.7,
      // Image sitemap extension — Google indexes these for Google Images
      // and uses them when picking SERP thumbnails for product results.
      images: [imageUrl],
    };
  });

  return [...staticPages, ...collectionPages, ...productPages];
}
