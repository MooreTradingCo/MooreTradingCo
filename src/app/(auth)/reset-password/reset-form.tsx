"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetForm({ email, token }: { email: string; token: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    resetPassword,
    null,
  );

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <p className="text-brand-700">Your password has been updated.</p>
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
