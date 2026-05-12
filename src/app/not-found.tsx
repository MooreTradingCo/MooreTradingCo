import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-brand-600 mb-4">404</p>
      <h1 className="font-display text-5xl text-brand-900 mb-3">
        We can&apos;t find that page.
      </h1>
      <p className="text-brand-700 mb-8 max-w-md">
        The link may be broken, or the product may no longer be available.
      </p>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
