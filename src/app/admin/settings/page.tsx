import { db } from "@/db";
import { categories, settings } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SettingsForms } from "./settings-forms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [cats, settingRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(settings),
  ]);
  const settingsMap = Object.fromEntries(settingRows.map((s) => [s.key, s.value]));
  return (
    <div>
      <h1 className="font-display text-3xl text-brand-900 mb-6">Settings</h1>
      <SettingsForms categories={cats} settings={settingsMap} />
    </div>
  );
}
