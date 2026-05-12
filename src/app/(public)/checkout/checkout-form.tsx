"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/utils";
import {
  quoteCheckout,
  placeOrder,
  type CheckoutQuote,
} from "@/server/actions/checkout";
import type { Address } from "@/db/schema";

// Square Web SDK only loads in the browser
const PaymentForm = dynamic(
  () => import("react-square-web-payments-sdk").then((m) => m.PaymentForm),
  { ssr: false },
) as unknown as React.ComponentType<any>;
const CreditCard = dynamic(
  () => import("react-square-web-payments-sdk").then((m) => m.CreditCard),
  { ssr: false },
) as unknown as React.ComponentType<any>;

type AddressFields = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export function CheckoutForm({
  defaultEmail,
  defaultName,
  savedAddresses,
  squareAppId,
  squareLocationId,
}: {
  defaultEmail: string;
  defaultName: string;
  savedAddresses: Address[];
  squareAppId: string;
  squareLocationId: string;
}) {
  const router = useRouter();
  const [fields, setFields] = useState<AddressFields>(() => {
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    return {
      fullName: def?.fullName ?? defaultName,
      email: defaultEmail,
      phone: def?.phone ?? "",
      line1: def?.line1 ?? "",
      line2: def?.line2 ?? "",
      city: def?.city ?? "",
      region: def?.region ?? "",
      postalCode: def?.postalCode ?? "",
      country: def?.country ?? "US",
    };
  });
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [quoting, startQuoting] = useTransition();
  const [placing, startPlacing] = useTransition();

  const handleField = (key: keyof AddressFields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setQuote(null);
  };

  const fetchQuote = () => {
    setQuoteError(null);
    startQuoting(async () => {
      const res = await quoteCheckout(fields);
      if (res.ok) setQuote(res.quote);
      else setQuoteError(res.error);
    });
  };

  const handlePayment = async (token: any, verifiedBuyer: any) => {
    setPlaceError(null);
    if (!quote) return;
    startPlacing(async () => {
      const res = await placeOrder({
        ...fields,
        sourceId: token.token!,
        verificationToken: verifiedBuyer?.token,
      });
      if (res.ok) {
        router.push(`/checkout/success?order=${res.orderNumber}`);
      } else {
        setPlaceError(res.error);
      }
    });
  };

  const addressComplete =
    fields.fullName && fields.email && fields.line1 && fields.city && fields.region && fields.postalCode;

  const squareConfigured = squareAppId && squareLocationId;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg border border-brand-200 p-6">
        <h2 className="font-semibold text-brand-900 mb-4">Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Email" required>
            <Input
              type="email"
              value={fields.email}
              onChange={(e) => handleField("email", e.target.value)}
              required
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              value={fields.phone}
              onChange={(e) => handleField("phone", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-brand-200 p-6">
        <h2 className="font-semibold text-brand-900 mb-4">Shipping address</h2>
        {savedAddresses.length > 0 && (
          <div className="mb-4">
            <Label className="mb-1.5 block">Use a saved address</Label>
            <select
              className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm"
              onChange={(e) => {
                const id = Number(e.target.value);
                const a = savedAddresses.find((x) => x.id === id);
                if (a) {
                  setFields((f) => ({
                    ...f,
                    fullName: a.fullName,
                    phone: a.phone ?? "",
                    line1: a.line1,
                    line2: a.line2 ?? "",
                    city: a.city,
                    region: a.region,
                    postalCode: a.postalCode,
                    country: a.country,
                  }));
                  setQuote(null);
                }
              }}
              defaultValue=""
            >
              <option value="">Select…</option>
              {savedAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label || a.fullName} — {a.line1}, {a.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name" required>
            <Input
              value={fields.fullName}
              onChange={(e) => handleField("fullName", e.target.value)}
              required
            />
          </Field>
          <Field label="Address line 1" required>
            <Input
              value={fields.line1}
              onChange={(e) => handleField("line1", e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Field label="Address line 2">
            <Input
              value={fields.line2}
              onChange={(e) => handleField("line2", e.target.value)}
            />
          </Field>
          <Field label="City" required>
            <Input
              value={fields.city}
              onChange={(e) => handleField("city", e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Field label="State" required>
            <Input
              value={fields.region}
              onChange={(e) => handleField("region", e.target.value.toUpperCase())}
              maxLength={2}
              required
            />
          </Field>
          <Field label="ZIP" required>
            <Input
              value={fields.postalCode}
              onChange={(e) => handleField("postalCode", e.target.value)}
              required
            />
          </Field>
          <Field label="Country">
            <Input value={fields.country} disabled />
          </Field>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={fetchQuote}
            disabled={!addressComplete || quoting}
            variant="outline"
          >
            {quoting ? "Calculating…" : quote ? "Recalculate" : "Calculate totals"}
          </Button>
          {quoteError && <p className="text-sm text-red-600">{quoteError}</p>}
        </div>
      </section>

      {quote && (
        <section className="bg-white rounded-lg border border-brand-200 p-6">
          <h2 className="font-semibold text-brand-900 mb-4">Totals</h2>
          <dl className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatMoney(quote.subtotalCents)} />
            <Row
              label={`Shipping (${quote.shippingMethod})`}
              value={formatMoney(quote.shippingCents)}
            />
            <Row label="Tax" value={formatMoney(quote.taxCents)} />
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-brand-900">
              <dt>Total</dt>
              <dd>{formatMoney(quote.totalCents)}</dd>
            </div>
          </dl>
        </section>
      )}

      {quote && squareConfigured && (
        <section className="bg-white rounded-lg border border-brand-200 p-6">
          <h2 className="font-semibold text-brand-900 mb-4">Payment</h2>
          <PaymentForm
            applicationId={squareAppId}
            locationId={squareLocationId}
            createPaymentRequest={() => ({
              countryCode: "US",
              currencyCode: "USD",
              total: {
                amount: (quote.totalCents / 100).toFixed(2),
                label: "Total",
              },
            })}
            cardTokenizeResponseReceived={handlePayment as any}
          >
            <CreditCard
              buttonProps={{
                isLoading: placing,
                css: {
                  backgroundColor: "#b53a2a",
                  fontSize: "16px",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#8f2c1f" },
                },
              }}
            >
              {placing ? "Placing order…" : `Pay ${formatMoney(quote.totalCents)}`}
            </CreditCard>
          </PaymentForm>
          {placeError && <p className="mt-3 text-sm text-red-600">{placeError}</p>}
          <p className="mt-3 text-xs text-brand-600">
            Payments are processed securely by Square. We never see your card.
          </p>
        </section>
      )}

      {quote && !squareConfigured && (
        <section className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-900">
          Square is not configured yet. Set NEXT_PUBLIC_SQUARE_APPLICATION_ID and
          NEXT_PUBLIC_SQUARE_LOCATION_ID to enable payments.
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-brand-700">{label}</dt>
      <dd className="font-medium text-brand-900">{value}</dd>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-600"> *</span>}
      </Label>
      {children}
    </div>
  );
}
