import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Moore Trading Co. started: small kitchen, slow simmer, big flavor.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-600 mb-3">
          Our story
        </p>
        <h1 className="font-display text-5xl text-brand-900">
          Built in a small kitchen.
        </h1>
        <p className="mt-6 text-lg text-brand-700">
          Moore Trading Co. is a family-run pantry company born from one
          simple idea: you should taste the difference when something is
          made by hand.
        </p>
      </header>

      <div className="relative aspect-[3/2] mb-12 rounded-lg overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80"
          alt="Spices on a wooden table"
          fill
          sizes="(min-width:768px) 768px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="prose prose-brand max-w-none text-brand-800 leading-relaxed space-y-6 text-lg">
        <p>
          We started Moore Trading Co. with a single rub and a folding
          table at the local farmers market. People kept coming back, so we
          kept making more. Today our line covers seasonings, sauces,
          finishing salts, and a few prepared foods we couldn&apos;t resist.
        </p>
        <p>
          Every product is blended, simmered, jarred, and labeled in our
          kitchen. We source whole spices and grind small. We taste-test
          obsessively. We don&apos;t cut corners.
        </p>
        <p>
          We&apos;re proud to ship across the country, and we love hearing
          how you&apos;re using our jars. Tag us, email us, or tell us at
          your next dinner party — we&apos;re listening.
        </p>
        <p className="text-brand-900 font-medium">
          — The Moore family
        </p>
      </div>
    </article>
  );
}
