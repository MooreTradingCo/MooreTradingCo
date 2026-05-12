import "server-only";

export type ShippingQuote = {
  method: string;
  amountCents: number;
  source: "usps" | "flat";
};

const FLAT_RATE_CENTS = 795;
const FREE_THRESHOLD_CENTS = 7500;

/**
 * Returns a shipping quote. Tries USPS API first when credentials are present,
 * otherwise falls back to a configurable flat rate. Free over the threshold.
 */
export async function quoteShipping(opts: {
  subtotalCents: number;
  weightOz: number;
  toZip: string;
  toState: string;
}): Promise<ShippingQuote> {
  if (opts.subtotalCents >= FREE_THRESHOLD_CENTS) {
    return { method: "Free Shipping", amountCents: 0, source: "flat" };
  }

  const clientId = process.env.USPS_CLIENT_ID;
  const clientSecret = process.env.USPS_CLIENT_SECRET;
  const fromZip = process.env.SHIP_FROM_ZIP;

  if (clientId && clientSecret && fromZip) {
    try {
      const usps = await fetchUspsRate({
        clientId,
        clientSecret,
        fromZip,
        toZip: opts.toZip,
        weightOz: opts.weightOz,
      });
      if (usps) return usps;
    } catch (err) {
      console.warn("[shipping] USPS quote failed, using flat rate:", err);
    }
  }

  return { method: "Standard Shipping", amountCents: FLAT_RATE_CENTS, source: "flat" };
}

async function fetchUspsRate(opts: {
  clientId: string;
  clientSecret: string;
  fromZip: string;
  toZip: string;
  weightOz: number;
}): Promise<ShippingQuote | null> {
  const tokenRes = await fetch("https://apis.usps.com/oauth2/v3/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
    }),
  });
  if (!tokenRes.ok) return null;
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) return null;

  const weightPounds = Math.max(0.0625, opts.weightOz / 16);
  const rateRes = await fetch("https://apis.usps.com/prices/v3/base-rates/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
    body: JSON.stringify({
      originZIPCode: opts.fromZip,
      destinationZIPCode: opts.toZip,
      weight: weightPounds,
      length: 6,
      width: 6,
      height: 4,
      mailClass: "USPS_GROUND_ADVANTAGE",
      processingCategory: "MACHINABLE",
      destinationEntryFacilityType: "NONE",
      rateIndicator: "SP",
      priceType: "RETAIL",
    }),
  });
  if (!rateRes.ok) return null;
  const data = (await rateRes.json()) as { totalBasePrice?: number };
  if (typeof data.totalBasePrice !== "number") return null;
  return {
    method: "USPS Ground Advantage",
    amountCents: Math.round(data.totalBasePrice * 100),
    source: "usps",
  };
}
