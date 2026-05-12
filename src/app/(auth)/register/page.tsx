import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-lg border border-brand-200 p-8 shadow-sm">
      <h1 className="font-display text-3xl text-brand-900 mb-2">Create your account</h1>
      <p className="text-sm text-brand-700 mb-6">
        We&apos;ll save your shipping info and order history.
      </p>
      <RegisterForm />
      <p className="text-sm text-brand-700 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-500 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
