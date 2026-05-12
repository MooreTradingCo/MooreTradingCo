import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, session.user.id)))
    .limit(1);
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return (
    <div>
      <nav className="mb-4 text-sm">
        <Link href="/account/orders" className="text-brand-700 hover:text-accent-500">
          &larr; All orders
        </Link>
      </nav>
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-display text-3xl text-brand-900">
          Order {order.orderNumber}
        </h1>
        <span className="inline-flex px-3 py-1 text-xs rounded-full bg-brand-100 text-brand-800 capitalize">
          {order.status}
        </span>
      </div>
      <p className="text-brand-700 mb-8">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-brand-200 p-6">
          <h2 className="font-semibold text-brand-900 mb-4">Items</h2>
          <ul className="divide-y divide-brand-100">
            {items.map((i) => (
              <li key={i.id} className="py-3 flex justify-between gap-3">
                <div>
                  <p className="text-brand-900">{i.productName}</p>
                  <p className="text-sm text-brand-600">Qty {i.quantity}</p>
                </div>
                <p className="font-medium text-brand-900">
                  {formatMoney(i.priceCents * i.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{formatMoney(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>{formatMoney(order.taxCents)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 font-semibold text-brand-900">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalCents)}</dd>
            </div>
          </dl>
        </div>

        <aside className="bg-white rounded-lg border border-brand-200 p-6 h-fit">
          <h3 className="font-semibold text-brand-900 mb-3">Shipping</h3>
          <address className="not-italic text-sm text-brand-800 leading-relaxed">
            {order.shippingName}<br />
            {order.shippingLine1}<br />
            {order.shippingLine2 && <>{order.shippingLine2}<br /></>}
            {order.shippingCity}, {order.shippingRegion} {order.shippingPostal}
          </address>
          {order.trackingNumber && (
            <p className="mt-4 text-sm">
              <span className="text-brand-700">Tracking: </span>
              <span className="font-medium">{order.trackingNumber}</span>
            </p>
          )}
          {order.squareReceiptUrl && (
            <a
              href={order.squareReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-accent-500 hover:underline"
            >
              View Square receipt &rarr;
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
