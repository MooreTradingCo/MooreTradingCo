import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export const revalidate = 60;

async function getFeatured() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      shortDescription: products.shortDescription,
      priceCents: products.priceCents,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(4);
  return rows;
}

export default async function HomePage() {
  const featured = await getFeatured();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-900 text-cream">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=2000&q=80"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-200 mb-4">
              Small-batch, big flavor
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Seasonings, sauces &amp; salts, crafted by hand.
            </h1>
            <p className="mt-6 text-lg text-brand-100 max-w-xl">
              Every jar from Moore Trading Co. is blended in small batches,
              never mass-produced. Real ingredients. Real depth. Real food.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="accent">
                <Link href="/shop">Shop the collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-cream/10 border-cream/30 text-cream hover:bg-cream/20">
                <Link href="/about">Our story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-brand-900">Featured</h2>
            <p className="text-brand-700 mt-2">A few favorites from the kitchen.</p>
          </div>
          <Link href="/shop" className="text-sm font-medium text-accent-500 hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
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
              </div>
              <div className="p-4">
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
      </section>

      <section className="bg-brand-100 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-brand-900">
            Three principles. No compromises.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <div>
              <h3 className="font-display text-xl text-brand-800 mb-2">Real ingredients</h3>
              <p className="text-brand-700">
                Whole spices, fresh aromatics, and never a synthetic shortcut.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-brand-800 mb-2">Small batches</h3>
              <p className="text-brand-700">
                Hand-blended in batches so small we know every jar by name.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-brand-800 mb-2">Shipped fresh</h3>
              <p className="text-brand-700">
                Orders ship within 48 hours, packed with care, never sitting on a shelf.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
