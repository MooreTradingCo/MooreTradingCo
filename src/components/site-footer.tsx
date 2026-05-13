import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-900 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-2xl font-semibold mb-3">
            Moore Trading Co.
          </h3>
          <p className="text-sm text-cream/75 leading-relaxed max-w-xs">
            Small-batch pantry stuff that makes everything else taste like it
            tried harder.
          </p>
          <p className="font-accent text-mustard-300 text-xl mt-4">
            with love, from a small kitchen
          </p>
        </div>

        <div>
          <FooterHeading>Shop</FooterHeading>
          <FooterList>
            <FooterLink href="/shop">Everything</FooterLink>
            <FooterLink href="/shop?category=seasonings">Seasonings</FooterLink>
            <FooterLink href="/shop?category=sauces">Sauces</FooterLink>
            <FooterLink href="/shop?category=salts">Finishing Salts</FooterLink>
            <FooterLink href="/shop?category=prepared-foods">Prepared Foods</FooterLink>
          </FooterList>
        </div>

        <div>
          <FooterHeading>Company</FooterHeading>
          <FooterList>
            <FooterLink href="/about">Our Story</FooterLink>
            <FooterLink href="/account">My Account</FooterLink>
            <FooterLink href="/account/orders">Track an Order</FooterLink>
          </FooterList>
        </div>

        <div>
          <FooterHeading>Help</FooterHeading>
          <FooterList>
            <li>
              <a
                href="mailto:hello@mooretradingco.com"
                className="text-cream/80 hover:text-mustard-300 transition-colors"
              >
                hello@mooretradingco.com
              </a>
            </li>
          </FooterList>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-cream/55">
          <p>&copy; {new Date().getFullYear()} Moore Trading Co. All rights reserved.</p>
          <p>mooretradingco.com</p>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] mb-4 text-mustard-300">
      {children}
    </h4>
  );
}

function FooterList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 text-sm">{children}</ul>;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-cream/80 hover:text-mustard-300 transition-colors">
        {children}
      </Link>
    </li>
  );
}
