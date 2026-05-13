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
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <h1 className="font-display font-semibold text-5xl sm:text-6xl text-forest-900 mb-10 leading-[0.95]">
        Your cart.
      </h1>

      {cart.lines.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-100 p-16 text-center">
          <p className="font-display text-2xl text-forest-900 mb-2">
            Nothing in here yet.
          </p>
          <p className="text-ink/70 mb-8">
            Empty carts make us sad. Fix that?
          </p>
          <Button asChild size="lg" variant="accent">
            <Link href="/shop">Browse the shop &rarr;</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cart.lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </div>
          <aside className="bg-stone-100 ring-1 ring-stone-300 rounded-2xl p-6 h-fit">
            <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
              Summary
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-forest-700">Subtotal</dt>
                <dd className="font-semibold text-forest-900">
                  {formatMoney(cart.subtotalCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-700">Shipping</dt>
                <dd className="text-ink/70">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-forest-700">Tax</dt>
                <dd className="text-ink/70">Calculated at checkout</dd>
              </div>
            </dl>
            <div className="mt-6 space-y-2">
              <Button asChild variant="accent" size="lg" className="w-full">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
