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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-3">
        <div className="aspect-square relative rounded-2xl overflow-hidden bg-stone-200 ring-1 ring-stone-300">
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
                className={`aspect-square relative rounded-lg overflow-hidden border-2 transition ${
                  mainImage === img.url ? "border-forest-900" : "border-transparent hover:border-stone-400"
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
          <p className="font-accent text-chili-500 text-2xl -rotate-1 origin-left">
            {product.categoryName.toLowerCase()}
          </p>
        )}
        <h1 className="font-display font-semibold text-4xl sm:text-5xl text-forest-900 mt-1 leading-[1.05]">
          {product.name}
        </h1>
        <p className="mt-4 font-display text-3xl font-semibold text-chili-600">
          {formatMoney(product.priceCents)}
        </p>
        <p className="text-sm text-forest-700 mt-1">
          {product.weightOz} oz
          {outOfStock ? " · Sold out" : product.stockQty < 10 ? ` · Only ${product.stockQty} left` : ""}
        </p>

        {product.shortDescription && (
          <p className="mt-6 text-ink/85 text-lg leading-relaxed">
            {product.shortDescription}
          </p>
        )}
        {product.description && (
          <p className="mt-3 text-ink/75 leading-relaxed">
            {product.description}
          </p>
        )}
        {product.ingredients && (
          <div className="mt-8 pt-6 border-t border-stone-300">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
              Ingredients
            </h3>
            <p className="mt-2 text-sm text-ink/80 leading-relaxed">{product.ingredients}</p>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <label htmlFor={`qty-${product.id}`} className="text-sm font-medium text-forest-900">
            Qty
          </label>
          <select
            id={`qty-${product.id}`}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            disabled={outOfStock}
            className="h-12 rounded-full border-2 border-forest-900 bg-cream px-4 text-sm font-medium text-forest-900"
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

        {error && <p className="mt-3 text-sm text-chili-700">{error}</p>}
      </div>
    </div>
  );
}
