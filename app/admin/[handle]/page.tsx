import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle, getProductsAdmin } from "@/lib/products-store";
import { COLLECTIONS } from "@/lib/products";
import { DISCOUNT_CODE } from "@/lib/shopify";
import EditForm from "./EditForm";
import SalesLinksCard from "./SalesLinksCard";

export const dynamic = "force-dynamic";

const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ?? "y823wg-nz.myshopify.com";
const SHOPIFY_PUBLIC_DOMAIN =
  process.env.SHOPIFY_PUBLIC_DOMAIN ?? SHOPIFY_STORE_DOMAIN;

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  // For `hidden` flag we need the admin view (which keeps soft-hidden rows).
  const all = await getProductsAdmin();
  const adminRow = all.find((p) => p.id === product.id);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.72rem",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "1.4rem",
        }}
      >
        <Link href="/admin" style={{ color: "rgba(58,142,255,0.8)" }}>
          ← Catalogue
        </Link>
        <span>·</span>
        <span>{product.collection}</span>
        <span>·</span>
        <Link
          href={`/products/${product.handle}`}
          target="_blank"
          style={{ color: "rgba(58,142,255,0.8)" }}
        >
          Voir la fiche publique ↗
        </Link>
      </div>

      <h1 style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
        Éditer : {product.title}
      </h1>
      <p
        style={{
          marginTop: 4,
          fontSize: "0.84rem",
          color: "rgba(255,255,255,0.55)",
          marginBottom: "2rem",
        }}
      >
        Les changements sont visibles sur airplanestore.fr en ~30 s après
        enregistrement (revalidation automatique). Aucun déploiement requis.
      </p>

      {/* Ventes & liens de paiement — sits above the editor so the price /
          stock context is visible before the user starts editing. */}
      <div style={{ marginBottom: 24 }}>
        <SalesLinksCard
          variantId={product.variantId}
          productHandle={product.handle}
          discountCode={DISCOUNT_CODE}
          shopifyPublicDomain={SHOPIFY_PUBLIC_DOMAIN}
          shopifyStoreDomain={SHOPIFY_STORE_DOMAIN}
        />
      </div>

      <EditForm
        product={product}
        hidden={adminRow?.hidden ?? false}
        collections={COLLECTIONS.map((c) => ({ slug: c.slug, label: c.label }))}
      />
    </main>
  );
}
