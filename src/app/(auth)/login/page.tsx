import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="bg-white rounded-lg border border-brand-200 p-8 shadow-sm">
      <h1 className="font-display text-3xl text-brand-900 mb-2">Welcome back</h1>
      <p className="text-sm text-brand-700 mb-6">
        Sign in to view orders and check out faster.
      </p>
      <LoginForm callbackUrl={sp.callbackUrl} />
      <p className="text-sm text-brand-700 mt-6">
        New here?{" "}
        <Link href="/register" className="text-accent-500 hover:underline font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
