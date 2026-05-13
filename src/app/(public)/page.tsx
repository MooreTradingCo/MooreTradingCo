import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { products, productImages, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import {
  Asterisk,
  Sparkle,
  Squiggle,
  WigglyUnderline,
} from "@/components/decorations";

export const revalidate = 60;

async function getFeatured() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      shortDescription: products.shortDescription,
      priceCents: products.priceCents,
      categoryName: categories.name,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(4);
  const seen = new Set<number>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

const ROTATING_WORDS = ["louder.", "wilder.", "weirder.", "better."];
const MARQUEE_ITEMS = [
  "seasonings",
  "sauces",
  "finishing salts",
  "chili crisp",
  "prepared foods",
  "jams",
  "whatever's next",
];

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* HERO ------------------------------------------------------------- */}
      <section className="paper relative bg-cream overflow-hidden">
        {/* Floating decorations */}
        <Asterisk
          size={96}
          className="absolute top-12 right-[6%] text-mustard-400 hidden md:block animate-[wiggle_6s_ease-in-out_infinite]"
        />
        <Sparkle
          size={28}
          className="absolute top-1/3 left-[8%] text-chili-500 hidden md:block"
        />
        <Sparkle
          size={20}
          className="absolute bottom-1/4 right-[14%] text-forest-700 hidden md:block"
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
          <p className="font-accent text-chili-500 text-2xl sm:text-3xl -rotate-2 origin-left">
            from a small kitchen, with love
          </p>

          <h1 className="font-display font-semibold text-forest-900 mt-4 text-[clamp(2.75rem,9vw,8rem)] leading-[0.95] tracking-tight max-w-5xl">
            <span className="block">We make food</span>
            <span className="block">taste{" "}
              <span className="wavy-underline text-chili-500">
                <span className="rotating-words h-[1em]">
                  <span>{ROTATING_WORDS[0]}</span>
                  <span>{ROTATING_WORDS[1]}</span>
                  <span>{ROTATING_WORDS[2]}</span>
                  <span>{ROTATING_WORDS[3]}</span>
                </span>
                <WigglyUnderline className="text-mustard-400" />
              </span>
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-ink/80 max-w-2xl leading-relaxed">
            Small-batch pantry stuff &mdash; seasonings, sauces, salts, chili
            crisp, and whatever else we feel like making next. Real
            ingredients. Tiny batches. Shipped fresh from our kitchen to yours.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="xl" variant="accent">
              <Link href="/shop">Shop everything &rarr;</Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/about">Our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CATEGORY MARQUEE -------------------------------------------------- */}
      <section
        aria-label="What we make"
        className="bg-forest-900 text-cream py-6 sm:py-8 overflow-hidden border-y-2 border-mustard-400"
      >
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-12 font-display text-4xl sm:text-6xl font-semibold tracking-tight whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(
            (item, i) => (
              <span key={i} className="flex items-center gap-12">
                <span
                  className={
                    i % 2 === 0 ? "text-cream" : "text-mustard-400 italic"
                  }
                >
                  {item}
                </span>
                <Sparkle
                  size={18}
                  className={
                    i % 3 === 0 ? "text-chili-500" : "text-mustard-400"
                  }
                />
              </span>
            ),
          )}
        </div>
      </section>

      {/* FEATURED ---------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <header className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-accent text-chili-500 text-2xl -rotate-1">
              try these first
            </p>
            <h2 className="font-display font-semibold text-forest-900 text-5xl sm:text-6xl mt-1">
              Crowd favorites.
            </h2>
            <Squiggle className="text-mustard-400 mt-3" />
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-chili-600 hover:text-chili-700 group inline-flex items-center gap-1"
          >
            See everything
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
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
      </section>

      {/* HOW WE MAKE STUFF ------------------------------------------------- */}
      <section className="relative bg-forest-900 text-cream py-20 sm:py-28 overflow-hidden">
        <Asterisk
          size={120}
          className="absolute -top-8 -left-8 text-mustard-400/20"
        />
        <Asterisk
          size={80}
          className="absolute bottom-12 right-[8%] text-chili-500/20"
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <p className="font-accent text-mustard-300 text-2xl -rotate-1">
            how we do it
          </p>
          <h2 className="font-display font-semibold text-5xl sm:text-6xl mt-1 max-w-2xl">
            Three rules. No compromises.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10">
            <Step n="01" title="Tiny batches">
              We blend, simmer, and jar in batches small enough that we know
              every jar by name. If a batch isn&apos;t right, it doesn&apos;t
              ship.
            </Step>
            <Step n="02" title="Real ingredients">
              Whole spices ground fresh. Real fruit, real chiles, real time on
              the stove. Never anything synthetic, never a shortcut.
            </Step>
            <Step n="03" title="Shipped fresh">
              Every order goes out within 48 hours, packed by hand. No
              warehouse, no shelf-aging, no factory.
            </Step>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-display text-7xl font-semibold text-mustard-400 leading-none">
        {n}
      </p>
      <h3 className="font-display text-2xl font-semibold mt-4">{title}</h3>
      <p className="text-cream/85 leading-relaxed mt-3">{children}</p>
    </div>
  );
}
