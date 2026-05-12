"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    requestPasswordReset,
    null,
  );

  if (state?.ok) {
    return (
      <p className="text-brand-700">
        If an account exists for that email, we&apos;ve sent a reset link.
        Check your inbox.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
