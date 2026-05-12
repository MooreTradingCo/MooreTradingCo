import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";
import { OrderStatusForm } from "./order-status-form";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return (
    <div>
      <nav className="mb-4 text-sm">
        <Link href="/admin/orders" className="text-brand-700 hover:text-accent-500">
          &larr; All orders
        </Link>
      </nav>
      <h1 className="font-display text-3xl text-brand-900 mb-1">
        Order {order.orderNumber}
      </h1>
      <p className="text-brand-700 mb-8">
        {order.email} · placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-brand-200 p-6">
          <h2 className="font-semibold text-brand-900 mb-4">Items</h2>
          <ul className="divide-y divide-brand-100">
            {items.map((i) => (
              <li key={i.id} className="py-2 flex justify-between gap-3">
                <span>{i.quantity} × {i.productName}</span>
                <span className="font-medium">{formatMoney(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatMoney(order.subtotalCents)} />
            <Row label="Shipping" value={formatMoney(order.shippingCents)} />
            <Row label="Tax" value={formatMoney(order.taxCents)} />
            <div className="flex justify-between border-t pt-2 mt-2 font-semibold text-brand-900">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalCents)}</dd>
            </div>
          </dl>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg border border-brand-200 p-6">
            <h3 className="font-semibold text-brand-900 mb-3">Update status</h3>
            <OrderStatusForm
              id={order.id}
              status={order.status}
              trackingNumber={order.trackingNumber ?? ""}
            />
          </div>

          <div className="bg-white rounded-lg border border-brand-200 p-6">
            <h3 className="font-semibold text-brand-900 mb-3">Shipping</h3>
            <address className="not-italic text-sm leading-relaxed text-brand-800">
              {order.shippingName}<br />
              {order.shippingLine1}<br />
              {order.shippingLine2 && <>{order.shippingLine2}<br /></>}
              {order.shippingCity}, {order.shippingRegion} {order.shippingPostal}
            </address>
          </div>

          {order.squareReceiptUrl && (
            <a
              href={order.squareReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-accent-500 hover:underline"
            >
              Square receipt &rarr;
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-brand-700">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
