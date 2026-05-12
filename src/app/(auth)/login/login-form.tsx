"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser, type ActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    loginUser,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-accent-500">
            Forgot?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
      </div>
      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
