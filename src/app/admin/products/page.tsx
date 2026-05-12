import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      priceCents: products.priceCents,
      stockQty: products.stockQty,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryName: categories.name,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .orderBy(desc(products.createdAt));

  const seen = new Set<number>();
  const uniqueRows = rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-brand-900">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-brand-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-100 text-brand-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {uniqueRows.map((p) => (
              <tr key={p.id} className="border-t border-brand-100">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-3 hover:text-accent-500"
                  >
                    <span className="relative w-10 h-10 bg-brand-100 rounded overflow-hidden">
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </span>
                    <span className="font-medium text-brand-900">{p.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-700">{p.categoryName ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatMoney(p.priceCents)}</td>
                <td className="px-4 py-3 text-right">{p.stockQty}</td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700">
                      Inactive
                    </span>
                  )}
                  {p.isFeatured && (
                    <span className="ml-1 inline-flex px-2 py-0.5 text-xs rounded-full bg-accent-500/10 text-accent-600">
                      Featured
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {uniqueRows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-brand-700 py-12">
                  No products yet. <Link href="/admin/products/new" className="text-accent-500 hover:underline">Create your first.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
