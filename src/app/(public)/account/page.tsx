import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">Profile</h1>
      <div className="bg-white rounded-lg border border-brand-200 p-6">
        <ProfileForm initialName={user?.name ?? ""} email={user?.email ?? ""} />
      </div>
    </div>
  );
}
