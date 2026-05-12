"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { addToCart } from "@/server/actions/cart";

export type ProductDetailData = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  shortDescription: string | null;
  priceCents: number;
  weightOz: number;
  stockQty: number;
  images: { url: string; alt: string | null }[];
  categoryName: string | null;
};

export function ProductDetail({ product }: { product: ProductDetailData }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mainImage, setMainImage] = useState(product.images[0]?.url);

  const outOfStock = product.stockQty <= 0;
  const maxQty = Math.min(product.stockQty, 10);

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await addToCart(product.id, qty);
      if (!result.ok) {
        setError(result.error);
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-brand-100">
          {mainImage && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setMainImage(img.url)}
                className={`aspect-square relative rounded overflow-hidden border-2 ${
                  mainImage === img.url ? "border-brand-700" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt={img.alt ?? ""} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.categoryName && (
          <p className="text-xs uppercase tracking-wider text-brand-600 mb-2">
            {product.categoryName}
          </p>
        )}
        <h1 className="font-display text-3xl sm:text-4xl text-brand-900">
          {product.name}
        </h1>
        <p className="mt-3 text-2xl font-semibold text-brand-900">
          {formatMoney(product.priceCents)}
        </p>
        <p className="text-sm text-brand-600 mt-1">
          {product.weightOz} oz
          {outOfStock ? " · Sold out" : product.stockQty < 10 ? ` · Only ${product.stockQty} left` : ""}
        </p>

        {product.shortDescription && (
          <p className="mt-6 text-brand-800 leading-relaxed">
            {product.shortDescription}
          </p>
        )}
        {product.description && (
          <p className="mt-3 text-brand-700 leading-relaxed">
            {product.description}
          </p>
        )}
        {product.ingredients && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
              Ingredients
            </h3>
            <p className="mt-2 text-sm text-brand-700">{product.ingredients}</p>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <label htmlFor={`qty-${product.id}`} className="text-sm text-brand-800">
            Qty
          </label>
          <select
            id={`qty-${product.id}`}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            disabled={outOfStock}
            className="h-10 rounded-md border border-brand-200 bg-white px-3 text-sm"
          >
            {Array.from({ length: Math.max(1, maxQty) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAdd}
            disabled={outOfStock || pending}
            variant="accent"
            size="lg"
            className="flex-1"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added to cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? "Sold out" : pending ? "Adding…" : "Add to cart"}
              </>
            )}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
