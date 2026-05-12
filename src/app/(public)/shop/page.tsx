import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { listProducts, listCategories } from "@/server/products";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse Moore Trading Co.'s small-batch seasonings, sauces, salts, and prepared foods.",
};

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const [items, cats] = await Promise.all([
    listProducts({ category: sp.category }),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-brand-900">Shop</h1>
        <p className="text-brand-700 mt-2">
          {sp.category
            ? cats.find((c) => c.slug === sp.category)?.description ?? ""
            : "Every jar, hand-blended in small batches."}
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        <CategoryChip href="/shop" active={!sp.category}>
          All
        </CategoryChip>
        {cats.map((c) => (
          <CategoryChip
            key={c.id}
            href={`/shop?category=${c.slug}`}
            active={sp.category === c.slug}
          >
            {c.name}
          </CategoryChip>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="text-brand-700">No products yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              scroll={false}
              className="group block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-brand-100 relative">
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(min-width:1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {p.stockQty <= 0 && (
                  <span className="absolute top-2 left-2 bg-charcoal text-cream text-xs px-2 py-1 rounded">
                    Sold out
                  </span>
                )}
              </div>
              <div className="p-4">
                {p.categoryName && (
                  <p className="text-xs uppercase tracking-wider text-brand-600 mb-1">
                    {p.categoryName}
                  </p>
                )}
                <h3 className="font-medium text-brand-900">{p.name}</h3>
                <p className="text-sm text-brand-700 line-clamp-2 mt-1">
                  {p.shortDescription}
                </p>
                <p className="mt-3 font-semibold text-brand-900">
                  {formatMoney(p.priceCents)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-800 text-cream"
          : "bg-brand-100 text-brand-800 hover:bg-brand-200"
      }`}
    >
      {children}
    </Link>
  );
}
