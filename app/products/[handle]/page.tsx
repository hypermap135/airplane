import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { PRODUCTS, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ handle: p.handle }));
}

export function generateMetadata({ params }: { params: { handle: string } }) {
  const product = getProduct(params.handle);
  if (!product) return { title: "Produit" };
  return {
    title: product.title,
    description: product.subtitle ?? "Maquette d'avion en résine premium.",
  };
}

export default function ProductPage({ params }: { params: { handle: string } }) {
  const product = getProduct(params.handle);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
