import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
      <h1 className="font-display text-4xl text-brand-900 mb-3">Order placed!</h1>
      <p className="text-brand-700 mb-2">
        Thanks for supporting a small kitchen. We&apos;ll email you a receipt
        and ship your order within 48 hours.
      </p>
      {sp.order && (
        <p className="text-brand-700 mb-8">
          Order number: <span className="font-semibold">{sp.order}</span>
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link href="/shop">Keep shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>
    </div>
  );
}
