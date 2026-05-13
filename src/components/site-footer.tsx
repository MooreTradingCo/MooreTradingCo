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
                href="mailto:support@mooretradingco.com"
                className="text-cream/80 hover:text-mustard-300 transition-colors"
              >
                support@mooretradingco.com
              </a>
            </li>
          </FooterList>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-mustard-300">
            Follow along
          </p>
          <div className="mt-3 flex gap-2">
            <SocialLink
              href="https://www.instagram.com/mooretradingco/"
              label="Instagram"
            >
              <InstagramIcon />
            </SocialLink>
            <SocialLink
              href="https://www.facebook.com/profile.php?id=61589208586027"
              label="Facebook"
            >
              <FacebookIcon />
            </SocialLink>
          </div>
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

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream/80 hover:text-mustard-300 hover:bg-forest-700 transition-colors"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.645.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.069 4.85-.069zm0 1.802c-3.142 0-3.514.012-4.755.069-1.025.047-1.58.218-1.948.362-.49.19-.84.418-1.207.785-.368.368-.595.717-.785 1.207-.144.368-.315.923-.362 1.948-.057 1.241-.069 1.613-.069 4.755s.012 3.514.069 4.755c.047 1.025.218 1.58.362 1.948.19.49.418.84.785 1.207.367.367.717.595 1.207.785.368.144.923.315 1.948.362 1.241.057 1.613.069 4.755.069s3.514-.012 4.755-.069c1.025-.047 1.58-.218 1.948-.362.49-.19.84-.418 1.207-.785.367-.367.595-.717.785-1.207.144-.368.315-.923.362-1.948.057-1.241.069-1.613.069-4.755s-.012-3.514-.069-4.755c-.047-1.025-.218-1.58-.362-1.948-.19-.49-.418-.84-.785-1.207-.367-.368-.717-.595-1.207-.785-.368-.144-.923-.315-1.948-.362-1.241-.057-1.613-.069-4.755-.069zM12 6.865A5.135 5.135 0 1 0 12 17.135 5.135 5.135 0 0 0 12 6.865zm0 8.468A3.333 3.333 0 1 1 12 8.667a3.333 3.333 0 0 1 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}
