import "server-only";
import { cookies } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

import { db } from "@/db";
import { carts, cartItems, products, productImages } from "@/db/schema";
import { auth } from "@/auth";

const CART_COOKIE = "mtc_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function readCartId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}

export async function setCartCookie(cartId: string) {
  const jar = await cookies();
  jar.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearCartCookie() {
  const jar = await cookies();
  jar.delete(CART_COOKIE);
}

/** Returns the active cart id, creating one if needed. */
export async function getOrCreateCartId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  let cartId = await readCartId();

  if (cartId) {
    const [existing] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
    if (existing) {
      if (userId && !existing.userId) {
        await db.update(carts).set({ userId }).where(eq(carts.id, cartId));
      }
      return existing.id;
    }
  }

  if (userId) {
    const [userCart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);
    if (userCart) {
      await setCartCookie(userCart.id);
      return userCart.id;
    }
  }

  const [created] = await db
    .insert(carts)
    .values({ userId: userId ?? undefined })
    .returning();
  await setCartCookie(created.id);
  return created.id;
}

export async function getCartItemCount(): Promise<number> {
  const cartId = await readCartId();
  if (!cartId) return 0;
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  return Number(row?.total ?? 0);
}

export type CartLine = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl: string | null;
  stockQty: number;
  lineTotalCents: number;
};

export async function getCart(): Promise<{
  id: string | null;
  lines: CartLine[];
  subtotalCents: number;
  itemCount: number;
}> {
  const cartId = await readCartId();
  if (!cartId) return { id: null, lines: [], subtotalCents: 0, itemCount: 0 };

  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      slug: products.slug,
      name: products.name,
      priceCents: products.priceCents,
      stockQty: products.stockQty,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, cartId));

  const ids = rows.map((r) => r.productId);
  const imgs = ids.length
    ? await db
        .select()
        .from(productImages)
        .where(sql`${productImages.productId} in (${sql.join(ids, sql`, `)})`)
    : [];
  const imageByProduct = new Map<number, string>();
  for (const i of imgs) {
    if (!imageByProduct.has(i.productId)) imageByProduct.set(i.productId, i.url);
  }

  const lines: CartLine[] = rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    slug: r.slug,
    name: r.name,
    priceCents: r.priceCents,
    quantity: r.quantity,
    imageUrl: imageByProduct.get(r.productId) ?? null,
    stockQty: r.stockQty,
    lineTotalCents: r.priceCents * r.quantity,
  }));

  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { id: cartId, lines, subtotalCents, itemCount };
}

export async function _ensureCartIdForMutation(): Promise<string> {
  return getOrCreateCartId();
}

export { and };
