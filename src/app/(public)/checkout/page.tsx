import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCart } from "@/server/cart";
import { auth } from "@/auth";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CheckoutForm } from "./checkout-form";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) redirect("/cart");

  const session = await auth();
  const savedAddresses = session?.user
    ? await db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, session.user.id))
        .orderBy(desc(addresses.isDefault), desc(addresses.createdAt))
    : [];

  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl text-brand-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <CheckoutForm
          defaultEmail={session?.user?.email ?? ""}
          defaultName={session?.user?.name ?? ""}
          savedAddresses={savedAddresses}
          squareAppId={appId}
          squareLocationId={locationId}
        />
        <aside className="bg-white rounded-lg border border-brand-200 p-6 h-fit">
          <h2 className="font-semibold text-brand-900 mb-4">Order summary</h2>
          <ul className="divide-y divide-brand-100 mb-4">
            {cart.lines.map((l) => (
              <li key={l.id} className="py-2 flex justify-between text-sm gap-2">
                <span className="text-brand-800">
                  {l.quantity} × {l.name}
                </span>
                <span className="font-medium text-brand-900 whitespace-nowrap">
                  {formatMoney(l.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-brand-600">
            Shipping &amp; tax will appear after you enter your address.
          </p>
        </aside>
      </div>
    </div>
  );
}
