import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">New product</h1>
      <ProductForm categories={cats} />
    </div>
  );
}
