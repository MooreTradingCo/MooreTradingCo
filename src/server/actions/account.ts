"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users, addresses } from "@/db/schema";
import { auth } from "@/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

const profileSchema = z.object({
  name: z.string().min(1).max(200),
});

export async function updateProfile(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = profileSchema.safeParse({ name: formData.get("name") });
    if (!parsed.success) return { ok: false, error: "Enter your name" };
    await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, userId));
    revalidatePath("/account");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to update profile" };
  }
}

const addressSchema = z.object({
  label: z.string().max(80).optional(),
  fullName: z.string().min(1).max(200),
  phone: z.string().max(40).optional(),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(120),
  region: z.string().min(1).max(80),
  postalCode: z.string().min(3).max(20),
  country: z.string().length(2).default("US"),
  isDefault: z.coerce.boolean().optional(),
});

export async function saveAddress(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const idRaw = formData.get("id");
    const id = idRaw ? Number(idRaw) : null;
    const parsed = addressSchema.safeParse({
      label: formData.get("label") || undefined,
      fullName: formData.get("fullName"),
      phone: formData.get("phone") || undefined,
      line1: formData.get("line1"),
      line2: formData.get("line2") || undefined,
      city: formData.get("city"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country") || "US",
      isDefault: formData.get("isDefault") === "on",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address" };
    }

    if (parsed.data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }

    if (id) {
      await db
        .update(addresses)
        .set({ ...parsed.data })
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
    } else {
      await db.insert(addresses).values({ ...parsed.data, userId });
    }
    revalidatePath("/account/addresses");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to save address" };
  }
}

export async function deleteAddress(id: number): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
    revalidatePath("/account/addresses");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to delete address" };
  }
}
