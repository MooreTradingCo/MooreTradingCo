import Link from "next/link";
import type { Metadata } from "next";
import { verifyEmailToken } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const sp = await searchParams;
  let verified = false;
  if (sp.token && sp.email) {
    verified = await verifyEmailToken(sp.email, sp.token);
  }

  return (
    <div className="bg-white rounded-lg border border-brand-200 p-8 shadow-sm">
      <h1 className="font-display text-3xl text-brand-900 mb-3">
        {verified ? "Email confirmed" : "Couldn't verify"}
      </h1>
      <p className="text-brand-700 mb-6">
        {verified
          ? "Thanks for confirming your email. You're all set."
          : "The link is invalid or has expired. You can request a new one from your account."}
      </p>
      <Button asChild className="w-full">
        <Link href={verified ? "/account" : "/login"}>
          {verified ? "Go to account" : "Sign in"}
        </Link>
      </Button>
    </div>
  );
}
