import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductDetail } from "@/components/product-detail";
import { getProductBySlug } from "@/server/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="mb-6 text-sm text-brand-700">
        <Link href="/shop" className="hover:text-accent-500">
          &larr; Back to shop
        </Link>
      </nav>
      <ProductDetail product={product} />
    </div>
  );
}
