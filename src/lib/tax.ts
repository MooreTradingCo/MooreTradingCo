import "server-only";
import Taxjar from "taxjar";

const apiToken = process.env.TAXJAR_API_TOKEN;
const sandbox = process.env.TAXJAR_SANDBOX === "true";

let _client: Taxjar | null = null;
function client() {
  if (!apiToken) return null;
  if (!_client) {
    _client = new Taxjar({
      apiKey: apiToken,
      apiUrl: sandbox ? Taxjar.SANDBOX_API_URL : Taxjar.DEFAULT_API_URL,
    });
  }
  return _client;
}

/**
 * Returns sales-tax cents for an order. Falls back to 0 if TaxJar is not
 * configured (the owner can configure it before going live).
 */
export async function calculateTaxCents(opts: {
  shipping: {
    toZip: string;
    toState: string;
    toCity: string;
    toCountry?: string;
  };
  shippingCents: number;
  lineItems: { id: string; quantity: number; unitPriceCents: number }[];
}): Promise<number> {
  const c = client();
  if (!c) return 0;
  const fromZip = process.env.SHIP_FROM_ZIP ?? "";
  const fromState = process.env.SHIP_FROM_STATE ?? "";
  if (!fromZip || !fromState) return 0;

  try {
    const res = await c.taxForOrder({
      from_country: "US",
      from_state: fromState,
      from_zip: fromZip,
      to_country: opts.shipping.toCountry ?? "US",
      to_state: opts.shipping.toState,
      to_zip: opts.shipping.toZip,
      to_city: opts.shipping.toCity,
      shipping: opts.shippingCents / 100,
      line_items: opts.lineItems.map((li) => ({
        id: li.id,
        quantity: li.quantity,
        unit_price: li.unitPriceCents / 100,
        product_tax_code: "40030", // grocery food
      })),
    });
    return Math.round((res.tax.amount_to_collect ?? 0) * 100);
  } catch (err) {
    console.warn("[tax] TaxJar lookup failed; charging $0 tax:", err);
    return 0;
  }
}
