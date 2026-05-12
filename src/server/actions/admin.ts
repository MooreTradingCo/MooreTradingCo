"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";

import { db } from "@/db";
import {
  products,
  productImages,
  orders,
  categories,
  settings,
} from "@/db/schema";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";
import { saveTaxRateMap, type TaxRateMap } from "@/lib/tax";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export type AdminResult<T = {}> = ({ ok: true } & T) | { ok: false; error: string };

const productSchema = z.object({
  name: z.string().min(1).max(200),
  shortDescription: z.string().max(280).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  ingredients: z.string().optional().or(z.literal("")),
  categoryId: z.coerce.number().int().optional(),
  priceCents: z.coerce.number().int().min(0),
  weightOz: z.coerce.number().int().min(0).default(4),
  stockQty: z.coerce.number().int().min(0).default(0),
  sku: z.string().max(64).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export async function saveProduct(
  _: AdminResult<{ id: number }> | null,
  formData: FormData,
): Promise<AdminResult<{ id: number }>> {
  try {
    await requireAdmin();
    const idRaw = formData.get("id");
    const id = idRaw ? Number(idRaw) : null;

    const parsed = productSchema.safeParse({
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription") ?? "",
      description: formData.get("description") ?? "",
      ingredients: formData.get("ingredients") ?? "",
      categoryId: formData.get("categoryId") || undefined,
      priceCents: formData.get("priceCents"),
      weightOz: formData.get("weightOz") || 4,
      stockQty: formData.get("stockQty") || 0,
      sku: formData.get("sku") ?? "",
      isActive: formData.get("isActive") === "on",
      isFeatured: formData.get("isFeatured") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const values = {
      ...parsed.data,
      slug: slugify(parsed.data.name),
      updatedAt: new Date(),
    };

    let savedId = id;
    if (id) {
      await db.update(products).set(values).where(eq(products.id, id));
    } else {
      const [row] = await db.insert(products).values(values).returning();
      savedId = row.id;
    }

    // Handle uploaded images
    const files = formData.getAll("images") as File[];
    for (const f of files) {
      if (!f || !(f instanceof File) || f.size === 0) continue;
      const blob = await put(
        `products/${savedId}/${Date.now()}-${f.name}`,
        f,
        { access: "public", addRandomSuffix: true },
      );
      await db.insert(productImages).values({
        productId: savedId!,
        url: blob.url,
        alt: parsed.data.name,
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/", "layout");
    return { ok: true, id: savedId! };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not save product" };
  }
}

export async function deleteProductImage(id: number, url: string): Promise<AdminResult> {
  try {
    await requireAdmin();
    await db.delete(productImages).where(eq(productImages.id, id));
    try {
      await del(url);
    } catch {
      // ignore blob deletion failure (e.g. external URL)
    }
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not delete image" };
  }
}

export async function deleteProduct(id: number): Promise<AdminResult> {
  try {
    await requireAdmin();
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not delete" };
  }
}

const statusSchema = z.object({
  id: z.coerce.number().int(),
  status: z.enum(["pending", "paid", "fulfilled", "cancelled", "refunded"]),
  trackingNumber: z.string().optional(),
});

export async function updateOrderStatus(
  _: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  try {
    await requireAdmin();
    const parsed = statusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
      trackingNumber: formData.get("trackingNumber") || undefined,
    });
    if (!parsed.success) return { ok: false, error: "Invalid status" };
    await db
      .update(orders)
      .set({
        status: parsed.data.status,
        trackingNumber: parsed.data.trackingNumber,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parsed.data.id));
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not update order" };
  }
}

const categorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export async function saveCategory(_: AdminResult | null, formData: FormData): Promise<AdminResult> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug") || undefined,
      description: formData.get("description") || undefined,
    });
    if (!parsed.success) return { ok: false, error: "Invalid category" };
    await db
      .insert(categories)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug || slugify(parsed.data.name),
        description: parsed.data.description,
      })
      .onConflictDoNothing();
    revalidatePath("/admin/settings");
    revalidatePath("/shop");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not save category" };
  }
}

export async function saveTaxRates(rates: TaxRateMap): Promise<AdminResult> {
  try {
    await requireAdmin();
    await saveTaxRateMap(rates);
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not save tax rates" };
  }
}

export async function saveSetting(key: string, value: string): Promise<AdminResult> {
  try {
    await requireAdmin();
    await db
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Could not save setting" };
  }
}
