import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-200/70 bg-brand-900 text-cream mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-lg font-semibold mb-3">
            Moore Trading Co.
          </h3>
          <p className="text-sm text-brand-200">
            Small-batch seasonings, sauces, salts, and prepared foods.
            Crafted with care, shipped fresh.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 text-brand-100">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-brand-200">
            <li><Link href="/shop?category=seasonings" className="hover:text-cream">Seasonings</Link></li>
            <li><Link href="/shop?category=sauces" className="hover:text-cream">Sauces</Link></li>
            <li><Link href="/shop?category=salts" className="hover:text-cream">Finishing Salts</Link></li>
            <li><Link href="/shop?category=prepared-foods" className="hover:text-cream">Prepared Foods</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 text-brand-100">
            Company
          </h4>
          <ul className="space-y-2 text-sm text-brand-200">
            <li><Link href="/about" className="hover:text-cream">Our Story</Link></li>
            <li><Link href="/shop" className="hover:text-cream">All Products</Link></li>
            <li><Link href="/account" className="hover:text-cream">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 text-brand-100">
            Help
          </h4>
          <ul className="space-y-2 text-sm text-brand-200">
            <li><a href="mailto:hello@mooretradingco.com" className="hover:text-cream">Contact</a></li>
            <li><Link href="/account/orders" className="hover:text-cream">Track an Order</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-brand-300">
          <p>&copy; {new Date().getFullYear()} Moore Trading Co. All rights reserved.</p>
          <p>mooretradingco.com</p>
        </div>
      </div>
    </footer>
  );
}
