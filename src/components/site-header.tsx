import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { auth } from "@/auth";
import { getCartItemCount } from "@/server/cart";

export async function SiteHeader() {
  const session = await auth();
  const itemCount = await getCartItemCount();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-200/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-brand-900 tracking-tight">
            Moore Trading Co.
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-800">
          <Link href="/" className="hover:text-accent-500 transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-accent-500 transition-colors">
            Shop
          </Link>
          <Link href="/about" className="hover:text-accent-500 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link
              href="/account"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-brand-100"
              aria-label="Account"
            >
              <User className="h-5 w-5 text-brand-800" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 px-3 items-center text-sm font-medium text-brand-800 hover:text-accent-500"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-brand-100"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5 text-brand-800" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
