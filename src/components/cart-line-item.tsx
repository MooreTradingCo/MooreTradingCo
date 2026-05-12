"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { updateCartQuantity, removeFromCart } from "@/server/actions/cart";
import type { CartLine } from "@/server/cart";
import { formatMoney } from "@/lib/utils";

export function CartLineItem({ line }: { line: CartLine }) {
  const [pending, startTransition] = useTransition();
  const maxQty = Math.min(line.stockQty, 10);

  return (
    <div className="flex gap-4 bg-white rounded-lg border border-brand-200 p-4">
      <Link
        href={`/shop/${line.slug}`}
        className="relative w-24 h-24 rounded overflow-hidden bg-brand-100 flex-shrink-0"
      >
        {line.imageUrl && (
          <Image
            src={line.imageUrl}
            alt={line.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between gap-3">
          <Link
            href={`/shop/${line.slug}`}
            className="font-medium text-brand-900 hover:text-accent-500"
          >
            {line.name}
          </Link>
          <p className="font-semibold text-brand-900 whitespace-nowrap">
            {formatMoney(line.lineTotalCents)}
          </p>
        </div>
        <p className="text-sm text-brand-700 mt-1">
          {formatMoney(line.priceCents)} each
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <label htmlFor={`q-${line.id}`} className="text-sm text-brand-700">
              Qty
            </label>
            <select
              id={`q-${line.id}`}
              value={line.quantity}
              disabled={pending}
              onChange={(e) => {
                const q = Number(e.target.value);
                startTransition(() => {
                  void updateCartQuantity(line.id, q);
                });
              }}
              className="h-9 rounded-md border border-brand-200 bg-white px-2 text-sm"
            >
              {Array.from({ length: Math.max(1, maxQty) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => { void removeFromCart(line.id); })}
            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-accent-500"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
