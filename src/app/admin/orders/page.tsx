import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">Orders</h1>
      <div className="bg-white rounded-lg border border-brand-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-100 text-brand-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
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
                    href={`/admin/orders/${o.id}`}
                    className="text-accent-500 hover:underline font-medium"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-700">{o.email}</td>
                <td className="px-4 py-3 text-brand-700">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 capitalize">{o.status}</td>
                <td className="px-4 py-3 text-right">{formatMoney(o.totalCents)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-brand-700 py-12">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
