import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { auth } from "@/auth";
import { getCartItemCount } from "@/server/cart";

export async function SiteHeader() {
  const session = await auth();
  const itemCount = await getCartItemCount();

  return (
    <header className="sticky top-0 z-40 w-full bg-forest-900 text-cream shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl font-semibold tracking-tight text-cream group-hover:text-mustard-300 transition-colors">
            Moore Trading Co.
          </span>
          <span className="hidden lg:inline font-accent text-mustard-300 text-lg leading-none translate-y-0.5">
            est. small
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          {session?.user ? (
            <Link
              href="/account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-forest-700 transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex h-10 px-3 items-center text-sm font-medium hover:text-mustard-300 transition-colors"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-forest-700 transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-chili-500 px-1 text-[10px] font-bold text-cream ring-2 ring-forest-900">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-cream/90 hover:text-cream transition-colors group"
    >
      {children}
      <span className="pointer-events-none absolute left-3 right-3 bottom-1 h-0.5 origin-left scale-x-0 bg-mustard-400 transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
