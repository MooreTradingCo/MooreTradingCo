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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <aside className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-brand-600 mb-2">
            Signed in as
          </p>
          <p className="font-medium text-brand-900 mb-6 truncate">
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
              className="text-sm text-brand-600 hover:text-accent-500"
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
      className="block px-3 py-2 rounded-md text-sm font-medium text-brand-800 hover:bg-brand-100"
    >
      {children}
    </Link>
  );
}
