import Link from "next/link";
import type { Metadata } from "next";
import { getCart } from "@/server/cart";
import { CartLineItem } from "@/components/cart-line-item";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cart",
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-brand-900 mb-8">Your cart</h1>

      {cart.lines.length === 0 ? (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center">
          <p className="text-brand-700 mb-6">Your cart is empty.</p>
          <Button asChild>
            <Link href="/shop">Browse the shop</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cart.lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </div>
          <aside className="bg-white rounded-lg border border-brand-200 p-6 h-fit">
            <h2 className="font-semibold text-brand-900 mb-4">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-700">Subtotal</dt>
                <dd className="font-medium text-brand-900">
                  {formatMoney(cart.subtotalCents)}
                </dd>
              </div>
              <div className="flex justify-between text-brand-600">
                <dt>Shipping</dt>
                <dd>Calculated at checkout</dd>
              </div>
              <div className="flex justify-between text-brand-600">
                <dt>Tax</dt>
                <dd>Calculated at checkout</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Button asChild variant="accent" size="lg" className="w-full">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full mt-2">
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
