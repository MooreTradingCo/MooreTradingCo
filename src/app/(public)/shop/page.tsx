import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { listProducts, listCategories } from "@/server/products";
import { formatMoney } from "@/lib/utils";
import { Squiggle } from "@/components/decorations";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Every jar we currently make. Seasonings, sauces, salts, chili crisp, and prepared foods.",
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

  const activeCategory = sp.category
    ? cats.find((c) => c.slug === sp.category)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <header className="mb-12">
        <p className="font-accent text-chili-500 text-2xl -rotate-1">
          {activeCategory ? activeCategory.name.toLowerCase() : "everything we make"}
        </p>
        <h1 className="font-display font-semibold text-forest-900 text-5xl sm:text-7xl mt-1 leading-[0.95]">
          {activeCategory ? activeCategory.name + "." : "The pantry."}
        </h1>
        <Squiggle className="text-mustard-400 mt-4" />
        {activeCategory?.description && (
          <p className="text-ink/75 mt-6 text-lg max-w-2xl">
            {activeCategory.description}
          </p>
        )}
      </header>

      <nav className="mb-10 flex flex-wrap gap-2">
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
        <p className="text-ink/75">No products yet &mdash; check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              scroll={false}
              className="group block rounded-2xl overflow-hidden bg-stone-100 ring-1 ring-stone-300 hover:ring-forest-900 transition-all hover:-translate-y-1"
            >
              <div className="aspect-square bg-stone-200 relative overflow-hidden">
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(min-width:1024px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {p.categoryName && (
                  <span className="absolute top-3 left-3 bg-forest-900 text-cream text-xs font-medium px-2.5 py-1 rounded-full">
                    {p.categoryName}
                  </span>
                )}
                {p.stockQty <= 0 && (
                  <span className="absolute top-3 right-3 bg-chili-700 text-cream text-xs font-bold px-2.5 py-1 rounded-full">
                    Sold out
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold text-forest-900">
                  {p.name}
                </h3>
                <p className="text-sm text-ink/70 line-clamp-2 mt-1.5">
                  {p.shortDescription}
                </p>
                <p className="mt-4 font-accent text-2xl text-chili-600">
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
      className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold transition-all ${
        active
          ? "bg-chili-500 text-cream shadow-sm"
          : "bg-stone-200 text-forest-900 hover:bg-stone-300"
      }`}
    >
      {children}
    </Link>
  );
}
