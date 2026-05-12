import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AddressManager } from "./address-manager";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) return null;
  const list = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">Addresses</h1>
      <AddressManager initial={list} />
    </div>
  );
}
