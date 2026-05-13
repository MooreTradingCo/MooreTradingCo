import Link from "next/link";
import { auth } from "@/auth";
import { logoutUser } from "@/server/actions/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chili-600 mb-2">
            Signed in as
          </p>
          <p className="font-medium text-forest-900 mb-8 truncate">
            {session?.user?.email}
          </p>
          <NavLink href="/account">Profile</NavLink>
          <NavLink href="/account/orders">Orders</NavLink>
          <NavLink href="/account/addresses">Addresses</NavLink>
          {session?.user?.role === "admin" && (
            <NavLink href="/admin/products">Admin</NavLink>
          )}
          <form action={logoutUser} className="pt-4">
            <button
              type="submit"
              className="text-sm font-medium text-forest-700 hover:text-chili-600 transition-colors px-3"
            >
              Sign out
            </button>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm font-semibold text-forest-900 hover:bg-stone-200 transition-colors"
    >
      {children}
    </Link>
  );
}
