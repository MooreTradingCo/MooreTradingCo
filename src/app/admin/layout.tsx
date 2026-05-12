import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logoutUser } from "@/server/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="border-b border-brand-200 bg-brand-900 text-cream">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link href="/admin/products" className="font-display text-lg font-semibold">
            Moore Trading Co. · Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/products" className="hover:text-white/80">Products</Link>
            <Link href="/admin/orders" className="hover:text-white/80">Orders</Link>
            <Link href="/admin/settings" className="hover:text-white/80">Settings</Link>
            <Link href="/" className="hover:text-white/80">View site</Link>
            <form action={logoutUser}>
              <button className="text-sm hover:text-white/80">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
