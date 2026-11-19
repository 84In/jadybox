import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductDetailClient } from "@/components/features/products/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}