"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq, and, gt } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users, passwordResetTokens, verificationTokens } from "@/db/schema";
import { signIn, signOut } from "@/auth";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/lib/email/templates/password-reset";
import { VerifyEmail } from "@/lib/email/templates/verify-email";
import { absoluteUrl } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Enter a valid email").transform((s) => s.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerUser(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { ok: false, error: "An account already exists for that email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin =
    !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: isAdmin ? "admin" : "customer",
    })
    .returning();

  // Issue an email verification token and send a confirmation email
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await db.insert(verificationTokens).values({
    identifier: created.email,
    token,
    expires,
  });
  try {
    await sendEmail({
      to: created.email,
      subject: "Confirm your email",
      react: VerifyEmail({
        url: absoluteUrl(`/verify-email?token=${token}&email=${encodeURIComponent(created.email)}`),
        name: created.name,
      }),
    });
  } catch (err) {
    console.error("[register] failed to send verify email", err);
  }

  // Sign the user in automatically
  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });
  redirect("/account");
}

const loginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  password: z.string().min(1),
  callbackUrl: z.string().optional(),
});

export async function loginUser(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid email or password" };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    return { ok: false, error: "Invalid email or password" };
  }
  redirect(parsed.data.callbackUrl || "/account");
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

const forgotSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
});

export async function requestPasswordReset(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email" };
  const { email } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    const raw = crypto.randomUUID() + crypto.randomUUID();
    const hash = await bcrypt.hash(raw, 10);
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hash,
      expires,
    });
    try {
      await sendEmail({
        to: email,
        subject: "Reset your password",
        react: PasswordResetEmail({
          url: absoluteUrl(`/reset-password?token=${raw}&email=${encodeURIComponent(email)}`),
          name: user.name,
        }),
      });
    } catch (err) {
      console.error("[forgot] failed to send reset email", err);
    }
  }
  // Always succeed (don't leak whether the email exists)
  return { ok: true };
}

const resetSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  token: z.string().min(8),
  password: z.string().min(8),
});

export async function resetPassword(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { email, token, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return { ok: false, error: "Invalid or expired reset link" };

  const candidates = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        gt(passwordResetTokens.expires, new Date()),
      ),
    );

  let matched: typeof candidates[number] | undefined;
  for (const c of candidates) {
    if (c.usedAt) continue;
    if (await bcrypt.compare(token, c.tokenHash)) {
      matched = c;
      break;
    }
  }
  if (!matched) return { ok: false, error: "Invalid or expired reset link" };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, matched.id));

  return { ok: true };
}

export async function verifyEmailToken(email: string, token: string): Promise<boolean> {
  const e = email.toLowerCase();
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, e), eq(verificationTokens.token, token)))
    .limit(1);
  if (!row) return false;
  if (row.expires < new Date()) return false;

  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, e));
  await db
    .delete(verificationTokens)
    .where(and(eq(verificationTokens.identifier, e), eq(verificationTokens.token, token)));
  return true;
}
