import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">Orders</h1>
      {rows.length === 0 ? (
        <p className="text-brand-700">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="bg-white rounded-lg border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-100 text-brand-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t border-brand-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/account/orders/${o.orderNumber}`}
                      className="text-accent-500 hover:underline font-medium"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-700">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-800 capitalize">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-brand-900">
                    {formatMoney(o.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
