"use server";

import { z } from "zod";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { orders, orderItems, products, cartItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCart, clearCartCookie } from "@/server/cart";
import { quoteShipping } from "@/lib/shipping";
import { taxPercentageForState } from "@/lib/tax";
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

type AddressInput = z.infer<typeof addressSchema>;

export type CheckoutQuote = {
  subtotalCents: number;
  shippingCents: number;
  shippingMethod: string;
  taxCents: number;
  totalCents: number;
};

type CartLineForOrder = {
  id: number;
  productId: number;
  name: string;
  priceCents: number;
  quantity: number;
  stockQty: number;
};

/**
 * Build a Square Order request shared between calculate and create.
 * Tax is added as an ad-hoc additive ORDER-scoped tax (line items only, not shipping).
 * Shipping is added as a TOTAL_PHASE service charge so it isn't taxed.
 */
async function buildSquareOrder(opts: {
  cartLines: CartLineForOrder[];
  shipping: { method: string; amountCents: number };
  shippingState: string;
}) {
  const lineItems = opts.cartLines.map((l) => ({
    uid: `line-${l.productId}`,
    name: l.name,
    quantity: String(l.quantity),
    basePriceMoney: { amount: BigInt(l.priceCents), currency: "USD" as const },
  }));

  const taxPercentage = await taxPercentageForState(opts.shippingState);
  const taxes = taxPercentage
    ? [
        {
          uid: "sales-tax",
          name: `${opts.shippingState.toUpperCase()} Sales Tax`,
          percentage: taxPercentage,
          scope: "ORDER" as const,
          type: "ADDITIVE" as const,
        },
      ]
    : undefined;

  const serviceCharges =
    opts.shipping.amountCents > 0
      ? [
          {
            uid: "shipping",
            name: opts.shipping.method,
            amountMoney: {
              amount: BigInt(opts.shipping.amountCents),
              currency: "USD" as const,
            },
            calculationPhase: "TOTAL_PHASE" as const,
            taxable: false,
          },
        ]
      : undefined;

  return {
    locationId: squareLocationId,
    lineItems,
    taxes,
    serviceCharges,
  };
}

async function shippingAndCart(input: AddressInput) {
  const cart = await getCart();
  if (cart.lines.length === 0) {
    return { ok: false as const, error: "Your cart is empty" };
  }
  const totalWeightOz = cart.lines.reduce((s, l) => s + l.quantity * 4, 0);
  const shipping = await quoteShipping({
    subtotalCents: cart.subtotalCents,
    weightOz: totalWeightOz,
    toZip: input.postalCode,
    toState: input.region,
  });
  return { ok: true as const, cart, shipping };
}

export async function quoteCheckout(input: AddressInput): Promise<
  | { ok: true; quote: CheckoutQuote }
  | { ok: false; error: string }
> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid shipping address" };

  const sc = await shippingAndCart(parsed.data);
  if (!sc.ok) return sc;
  const { cart, shipping } = sc;

  if (!squareLocationId) {
    return { ok: false, error: "Store is not configured for payments yet" };
  }

  let calc;
  try {
    const square = getSquareClient();
    const orderBody = await buildSquareOrder({
      cartLines: cart.lines,
      shipping: { method: shipping.method, amountCents: shipping.amountCents },
      shippingState: parsed.data.region,
    });
    calc = await square.orders.calculate({ order: orderBody });
  } catch (err: any) {
    console.error("[checkout] orders.calculate failed:", err);
    return {
      ok: false,
      error: err?.errors?.[0]?.detail ?? err?.message ?? "Could not calculate totals",
    };
  }

  const order = calc.order;
  if (!order) return { ok: false, error: "Square did not return an order" };

  const totalTax = Number(order.totalTaxMoney?.amount ?? 0n);
  const totalService = Number(order.totalServiceChargeMoney?.amount ?? 0n);
  const total = Number(order.totalMoney?.amount ?? 0n);

  return {
    ok: true,
    quote: {
      subtotalCents: cart.subtotalCents,
      shippingCents: totalService,
      shippingMethod: shipping.method,
      taxCents: totalTax,
      totalCents: total,
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

  const sc = await shippingAndCart(parsed.data);
  if (!sc.ok) return sc;
  const { cart, shipping } = sc;

  for (const line of cart.lines) {
    if (line.stockQty < line.quantity) {
      return { ok: false, error: `Not enough stock for ${line.name}` };
    }
  }
  if (!squareLocationId) {
    return { ok: false, error: "Store is not configured for payments yet" };
  }

  const session = await auth();
  const square = getSquareClient();

  // 1) Create the Square Order (server-authoritative totals)
  let squareOrderId: string | null = null;
  let totalCents = 0;
  let taxCents = 0;
  let shippingCents = 0;
  try {
    const orderBody = await buildSquareOrder({
      cartLines: cart.lines,
      shipping: { method: shipping.method, amountCents: shipping.amountCents },
      shippingState: parsed.data.region,
    });
    const res = await square.orders.create({
      idempotencyKey: randomUUID(),
      order: orderBody,
    });
    if (!res.order?.id) {
      return { ok: false, error: "Square did not return an order" };
    }
    squareOrderId = res.order.id;
    totalCents = Number(res.order.totalMoney?.amount ?? 0n);
    taxCents = Number(res.order.totalTaxMoney?.amount ?? 0n);
    shippingCents = Number(res.order.totalServiceChargeMoney?.amount ?? 0n);
  } catch (err: any) {
    console.error("[checkout] orders.create failed:", err);
    return {
      ok: false,
      error: err?.errors?.[0]?.detail ?? err?.message ?? "Could not create order",
    };
  }

  // 2) Charge the card and link the payment to the Square order
  let squarePaymentId: string | null = null;
  let squareReceiptUrl: string | null = null;
  try {
    const res = await square.payments.create({
      idempotencyKey: randomUUID(),
      sourceId: parsed.data.sourceId,
      verificationToken: parsed.data.verificationToken,
      locationId: squareLocationId,
      orderId: squareOrderId,
      amountMoney: { amount: BigInt(totalCents), currency: "USD" },
      buyerEmailAddress: parsed.data.email,
      shippingAddress: {
        addressLine1: parsed.data.line1,
        addressLine2: parsed.data.line2,
        locality: parsed.data.city,
        administrativeDistrictLevel1: parsed.data.region,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country as "US",
      },
      note: "MTC order via mooretradingco.com",
    });

    const payment = res.payment;
    if (!payment || payment.status !== "COMPLETED") {
      return { ok: false, error: "Payment was not completed. Please try again." };
    }
    squarePaymentId = payment.id ?? null;
    squareReceiptUrl = payment.receiptUrl ?? null;
  } catch (err: any) {
    console.error("[checkout] payments.create failed:", err);
    return {
      ok: false,
      error: err?.errors?.[0]?.detail ?? err?.message ?? "Payment failed. Please try again.",
    };
  }

  // 3) Persist locally
  const orderNumber = generateOrderNumber();
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: session?.user?.id ?? null,
      email: parsed.data.email.toLowerCase(),
      status: "paid",
      subtotalCents: cart.subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      shippingMethod: shipping.method,
      squareOrderId,
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

  for (const line of cart.lines) {
    await db
      .update(products)
      .set({ stockQty: line.stockQty - line.quantity })
      .where(eq(products.id, line.productId));
  }

  if (cart.id) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  }
  await clearCartCookie();

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
        subtotalCents: cart.subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
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
