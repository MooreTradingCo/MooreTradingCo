import type { Metadata } from "next";
import {
  Asterisk,
  Sparkle,
  Squiggle,
  WigglyUnderline,
} from "@/components/decorations";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Moore Trading Co. started: one kitchen, a folding table, and a stubborn refusal to ship anything boring.",
};

export default function AboutPage() {
  return (
    <article className="paper relative bg-cream overflow-hidden">
      <Asterisk
        size={96}
        className="absolute top-16 right-[6%] text-mustard-400 hidden md:block"
      />
      <Sparkle
        size={22}
        className="absolute top-1/4 left-[5%] text-chili-500 hidden md:block"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="font-accent text-chili-500 text-2xl -rotate-2 origin-left">
          our story
        </p>
        <h1 className="font-display font-semibold text-forest-900 mt-2 text-[clamp(3rem,8vw,6rem)] leading-[0.95]">
          About{" "}
          <span className="wavy-underline text-chili-500">
            us.
            <WigglyUnderline className="text-mustard-400" />
          </span>
        </h1>
        <Squiggle className="text-mustard-400 mt-6" />

        <div className="mt-12 space-y-6 text-lg sm:text-xl text-ink/85 leading-relaxed">
          <p className="text-2xl text-forest-900 font-medium">
            Moore Trading Co. started with a folding table at a farmers market
            and one really good rub.
          </p>
          <p>
            People kept coming back, so we kept making more. A rub became a
            sauce. A sauce became a salt. A salt became a chili crisp. Now
            we&apos;ve got a whole pantry of small-batch stuff, and a few
            ideas we haven&apos;t put in jars yet.
          </p>
          <p>
            Every product is blended, simmered, jarred, and labeled by us. We
            buy whole spices and grind small. We taste obsessively. We say no
            to any recipe that we wouldn&apos;t put in our own kitchen first.
          </p>
          <p>
            We&apos;re proud to ship across the country, and we love hearing
            how you&apos;re using our jars. Tag us, email us, or tell us at
            your next dinner party &mdash; we&apos;re listening.
          </p>
        </div>

        <p className="font-accent text-chili-600 text-3xl mt-12 -rotate-1">
          &mdash; The Moore family
        </p>
      </div>
    </article>
  );
}
