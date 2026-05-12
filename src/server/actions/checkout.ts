"use server";

import { z } from "zod";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { orders, orderItems, products, cartItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCart, clearCartCookie } from "@/server/cart";
import { quoteShipping } from "@/lib/shipping";
import { calculateTaxCents } from "@/lib/tax";
import { getSquareClient, squareLocationId } from "@/lib/square";
import { sendEmail } from "@/lib/email";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { generateOrderNumber } from "@/lib/utils";

const addressSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(2).max(2),
  postalCode: z.string().min(3),
  country: z.string().length(2).default("US"),
});

export type CheckoutQuote = {
  subtotalCents: number;
  shippingCents: number;
  shippingMethod: string;
  taxCents: number;
  totalCents: number;
};

export async function quoteCheckout(input: z.infer<typeof addressSchema>): Promise<
  | { ok: true; quote: CheckoutQuote }
  | { ok: false; error: string }
> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid shipping address" };
  }

  const cart = await getCart();
  if (cart.lines.length === 0) return { ok: false, error: "Your cart is empty" };

  const totalWeightOz = cart.lines.reduce((s, l) => s + l.quantity * 4, 0);

  const shipping = await quoteShipping({
    subtotalCents: cart.subtotalCents,
    weightOz: totalWeightOz,
    toZip: parsed.data.postalCode,
    toState: parsed.data.region,
  });

  const taxCents = await calculateTaxCents({
    shipping: {
      toZip: parsed.data.postalCode,
      toState: parsed.data.region,
      toCity: parsed.data.city,
      toCountry: parsed.data.country,
    },
    shippingCents: shipping.amountCents,
    lineItems: cart.lines.map((l) => ({
      id: String(l.productId),
      quantity: l.quantity,
      unitPriceCents: l.priceCents,
    })),
  });

  return {
    ok: true,
    quote: {
      subtotalCents: cart.subtotalCents,
      shippingCents: shipping.amountCents,
      shippingMethod: shipping.method,
      taxCents,
      totalCents: cart.subtotalCents + shipping.amountCents + taxCents,
    },
  };
}

const placeSchema = addressSchema.extend({
  sourceId: z.string().min(1, "Payment token missing"),
  verificationToken: z.string().optional(),
});

export async function placeOrder(
  input: z.infer<typeof placeSchema>,
): Promise<
  { ok: true; orderNumber: string } | { ok: false; error: string }
> {
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid checkout payload" };

  const cart = await getCart();
  if (cart.lines.length === 0) return { ok: false, error: "Your cart is empty" };

  const session = await auth();

  // Re-quote on the server to avoid client tampering
  const quoted = await quoteCheckout(parsed.data);
  if (!quoted.ok) return quoted;
  const { quote } = quoted;

  // Verify stock once more
  for (const line of cart.lines) {
    if (line.stockQty < line.quantity) {
      return { ok: false, error: `Not enough stock for ${line.name}` };
    }
  }

  // Charge via Square
  let squarePaymentId: string | null = null;
  let squareReceiptUrl: string | null = null;
  try {
    const square = getSquareClient();
    if (!squareLocationId) {
      return { ok: false, error: "Store is not configured for payments yet" };
    }
    const res = await square.payments.create({
      idempotencyKey: randomUUID(),
      sourceId: parsed.data.sourceId,
      verificationToken: parsed.data.verificationToken,
      locationId: squareLocationId,
      amountMoney: {
        amount: BigInt(quote.totalCents),
        currency: "USD",
      },
      buyerEmailAddress: parsed.data.email,
      shippingAddress: {
        addressLine1: parsed.data.line1,
        addressLine2: parsed.data.line2,
        locality: parsed.data.city,
        administrativeDistrictLevel1: parsed.data.region,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country as "US",
      },
      note: `MTC order via mooretradingco.com`,
    });

    const payment = res.payment;
    if (!payment || payment.status !== "COMPLETED") {
      return { ok: false, error: "Payment was not completed. Please try again." };
    }
    squarePaymentId = payment.id ?? null;
    squareReceiptUrl = payment.receiptUrl ?? null;
  } catch (err: any) {
    console.error("[checkout] Square payment failed:", err);
    return {
      ok: false,
      error: err?.errors?.[0]?.detail ?? err?.message ?? "Payment failed. Please try again.",
    };
  }

  // Persist the order
  const orderNumber = generateOrderNumber();
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: session?.user?.id ?? null,
      email: parsed.data.email.toLowerCase(),
      status: "paid",
      subtotalCents: quote.subtotalCents,
      shippingCents: quote.shippingCents,
      taxCents: quote.taxCents,
      totalCents: quote.totalCents,
      shippingMethod: quote.shippingMethod,
      squarePaymentId,
      squareReceiptUrl,
      shippingName: parsed.data.fullName,
      shippingLine1: parsed.data.line1,
      shippingLine2: parsed.data.line2,
      shippingCity: parsed.data.city,
      shippingRegion: parsed.data.region,
      shippingPostal: parsed.data.postalCode,
      shippingCountry: parsed.data.country,
      shippingPhone: parsed.data.phone,
    })
    .returning();

  await db.insert(orderItems).values(
    cart.lines.map((l) => ({
      orderId: order.id,
      productId: l.productId,
      productName: l.name,
      priceCents: l.priceCents,
      quantity: l.quantity,
    })),
  );

  // Decrement stock
  for (const line of cart.lines) {
    await db
      .update(products)
      .set({ stockQty: line.stockQty - line.quantity })
      .where(eq(products.id, line.productId));
  }

  // Clear the cart
  if (cart.id) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  }
  await clearCartCookie();

  // Send confirmation email (fire and forget)
  try {
    await sendEmail({
      to: parsed.data.email,
      subject: `Order ${orderNumber} confirmed`,
      react: OrderConfirmationEmail({
        orderNumber,
        customerName: parsed.data.fullName,
        items: cart.lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          priceCents: l.priceCents,
        })),
        subtotalCents: quote.subtotalCents,
        shippingCents: quote.shippingCents,
        taxCents: quote.taxCents,
        totalCents: quote.totalCents,
        shipTo: {
          line1: parsed.data.line1,
          line2: parsed.data.line2,
          city: parsed.data.city,
          region: parsed.data.region,
          postalCode: parsed.data.postalCode,
        },
      }),
    });
  } catch (err) {
    console.error("[checkout] failed to send confirmation email", err);
  }

  return { ok: true, orderNumber };
}
