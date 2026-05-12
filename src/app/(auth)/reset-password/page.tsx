import type { Metadata } from "next";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.token || !sp.email) {
    return (
      <div className="bg-white rounded-lg border border-brand-200 p-8 shadow-sm">
        <h1 className="font-display text-2xl text-brand-900 mb-2">Invalid reset link</h1>
        <p className="text-brand-700">Request a new reset link from the login page.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg border border-brand-200 p-8 shadow-sm">
      <h1 className="font-display text-3xl text-brand-900 mb-6">Choose a new password</h1>
      <ResetForm email={sp.email} token={sp.token} />
    </div>
  );
}
