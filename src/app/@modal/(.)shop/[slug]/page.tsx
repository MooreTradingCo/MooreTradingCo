import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getProductBySlug } from "@/server/products";
import { ProductModalShell } from "./modal-shell";

export default async function InterceptedProductModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return (
    <ProductModalShell>
      <ProductDetail product={product} />
    </ProductModalShell>
  );
}
