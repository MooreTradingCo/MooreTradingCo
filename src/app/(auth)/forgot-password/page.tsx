import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-lg border border-brand-200 p-8 shadow-sm">
      <h1 className="font-display text-3xl text-brand-900 mb-2">Reset your password</h1>
      <p className="text-sm text-brand-700 mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ForgotForm />
    </div>
  );
}
