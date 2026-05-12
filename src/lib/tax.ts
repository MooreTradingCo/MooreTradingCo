import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

const TAX_RATES_KEY = "tax_rates_json";

export type TaxRateMap = Record<string, string>;

/** Reads { "WA": "8.8", "CA": "7.25", ... } from the settings table. */
export async function getTaxRateMap(): Promise<TaxRateMap> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, TAX_RATES_KEY))
    .limit(1);
  if (!row?.value) return {};
  try {
    const parsed = JSON.parse(row.value);
    if (parsed && typeof parsed === "object") {
      const out: TaxRateMap = {};
      for (const [k, v] of Object.entries(parsed)) {
        const upper = String(k).toUpperCase();
        const rate = String(v);
        if (upper && rate && !Number.isNaN(Number(rate))) out[upper] = rate;
      }
      return out;
    }
  } catch (err) {
    console.warn("[tax] tax_rates_json is malformed:", err);
  }
  return {};
}

export async function saveTaxRateMap(map: TaxRateMap): Promise<void> {
  const cleaned: TaxRateMap = {};
  for (const [k, v] of Object.entries(map)) {
    const upper = String(k).toUpperCase().trim();
    const num = Number(v);
    if (upper && upper.length === 2 && Number.isFinite(num) && num >= 0) {
      cleaned[upper] = String(num);
    }
  }
  const value = JSON.stringify(cleaned);
  await db
    .insert(settings)
    .values({ key: TAX_RATES_KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });
}

/** Returns the tax percentage (as a string like "8.8") for a shipping state, or null. */
export async function taxPercentageForState(state: string | null | undefined): Promise<string | null> {
  if (!state) return null;
  const map = await getTaxRateMap();
  return map[state.toUpperCase()] ?? null;
}
