import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mooretradingco.com";
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isActive, true));
    productEntries = rows.map((r) => ({
      url: `${base}/shop/${r.slug}`,
      lastModified: r.updatedAt,
    }));
  } catch (err) {
    console.warn("[sitemap] could not fetch products:", err);
  }

  return [
    { url: base, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.5 },
    ...productEntries,
  ];
}
