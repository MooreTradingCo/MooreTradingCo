"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { getOrCreateCartId } from "@/server/cart";

export async function addToCart(productId: number, quantity = 1) {
  if (quantity < 1) quantity = 1;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product || !product.isActive) {
    return { ok: false as const, error: "Product not available" };
  }
  if (product.stockQty < quantity) {
    return { ok: false as const, error: "Insufficient stock" };
  }

  const cartId = await getOrCreateCartId();

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    const nextQty = Math.min(existing.quantity + quantity, product.stockQty);
    await db
      .update(cartItems)
      .set({ quantity: nextQty })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      productId,
      quantity,
      priceAtAddCents: product.priceCents,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { ok: true as const };
}

export async function updateCartQuantity(itemId: number, quantity: number) {
  if (quantity < 1) {
    return removeFromCart(itemId);
  }
  const [item] = await db
    .select({ productId: cartItems.productId })
    .from(cartItems)
    .where(eq(cartItems.id, itemId))
    .limit(1);
  if (!item) return { ok: false as const, error: "Item not found" };

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, item.productId))
    .limit(1);
  if (!product) return { ok: false as const, error: "Product not found" };

  const nextQty = Math.min(quantity, product.stockQty);
  await db.update(cartItems).set({ quantity: nextQty }).where(eq(cartItems.id, itemId));
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { ok: true as const };
}

export async function removeFromCart(itemId: number) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { ok: true as const };
}
