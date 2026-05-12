import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import type { ProductDetailData } from "@/components/product-detail";

export async function listProducts(opts: { category?: string } = {}) {
  const where = [eq(products.isActive, true)];
  if (opts.category) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, opts.category))
      .limit(1);
    if (cat) where.push(eq(products.categoryId, cat.id));
  }

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      shortDescription: products.shortDescription,
      priceCents: products.priceCents,
      stockQty: products.stockQty,
      categoryName: categories.name,
      categorySlug: categories.slug,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(and(...where))
    .orderBy(desc(products.isFeatured), asc(products.name));

  // Deduplicate by product id (leftJoin on images may multiply rows)
  const seen = new Set<number>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export async function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const [p] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      ingredients: products.ingredients,
      shortDescription: products.shortDescription,
      priceCents: products.priceCents,
      weightOz: products.weightOz,
      stockQty: products.stockQty,
      isActive: products.isActive,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!p || !p.isActive) return null;

  const imgs = await db
    .select({ url: productImages.url, alt: productImages.alt })
    .from(productImages)
    .where(eq(productImages.productId, p.id))
    .orderBy(asc(productImages.sortOrder));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    ingredients: p.ingredients,
    shortDescription: p.shortDescription,
    priceCents: p.priceCents,
    weightOz: p.weightOz,
    stockQty: p.stockQty,
    categoryName: p.categoryName,
    images: imgs,
  };
}
