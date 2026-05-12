import { notFound } from "next/navigation";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ProductForm } from "../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) notFound();
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder));
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));

  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">Edit product</h1>
      <ProductForm categories={cats} product={product} images={images} />
    </div>
  );
}
