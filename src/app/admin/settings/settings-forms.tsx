"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveCategory,
  saveSetting,
  saveTaxRates,
  type AdminResult,
} from "@/server/actions/admin";
import type { Category } from "@/db/schema";
import type { TaxRateMap } from "@/lib/tax";

export function SettingsForms({
  categories,
  settings,
  taxRates,
}: {
  categories: Category[];
  settings: Record<string, string>;
  taxRates: TaxRateMap;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <Section title="Shipping origin">
        <ShippingForm settings={settings} />
      </Section>

      <Section title="Sales tax rates by state">
        <p className="text-xs text-brand-600 mb-3">
          Two-letter state codes (e.g. <code>WA</code>) and percentages (e.g. <code>8.8</code>).
          Tax is added by Square at checkout for the shipping destination&apos;s state.
          Leave blank for any state where you don&apos;t collect.
        </p>
        <TaxRatesForm initial={taxRates} />
      </Section>

      <Section title="Categories">
        <ul className="divide-y divide-brand-100 mb-4 text-sm">
          {categories.map((c) => (
            <li key={c.id} className="py-2 flex justify-between">
              <span className="text-brand-800">{c.name}</span>
              <span className="text-brand-600">{c.slug}</span>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="text-brand-600 py-2">No categories yet.</li>
          )}
        </ul>
        <CategoryForm />
      </Section>
    </div>
  );
}

function ShippingForm({ settings }: { settings: Record<string, string> }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await Promise.all([
            saveSetting("flat_shipping_cents", String(fd.get("flat_shipping_cents") ?? "0")),
            saveSetting(
              "free_shipping_threshold_cents",
              String(fd.get("free_shipping_threshold_cents") ?? "0"),
            ),
            saveSetting("shipping_origin_zip", String(fd.get("shipping_origin_zip") ?? "")),
            saveSetting("shipping_origin_state", String(fd.get("shipping_origin_state") ?? "")),
          ]);
          setMsg("Saved.");
        });
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Flat rate (cents)">
          <Input
            name="flat_shipping_cents"
            type="number"
            defaultValue={settings.flat_shipping_cents ?? "795"}
          />
        </Field>
        <Field label="Free over (cents)">
          <Input
            name="free_shipping_threshold_cents"
            type="number"
            defaultValue={settings.free_shipping_threshold_cents ?? "7500"}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Origin ZIP">
          <Input name="shipping_origin_zip" defaultValue={settings.shipping_origin_zip ?? ""} />
        </Field>
        <Field label="Origin state">
          <Input
            name="shipping_origin_state"
            defaultValue={settings.shipping_origin_state ?? ""}
            maxLength={2}
          />
        </Field>
      </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}

type RateRow = { state: string; rate: string };

function TaxRatesForm({ initial }: { initial: TaxRateMap }) {
  const [rows, setRows] = useState<RateRow[]>(() => {
    const entries = Object.entries(initial);
    return entries.length > 0
      ? entries.map(([state, rate]) => ({ state, rate }))
      : [];
  });
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const updateRow = (i: number, patch: Partial<RateRow>) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));
  const addRow = () => setRows((rs) => [...rs, { state: "", rate: "" }]);

  const handleSave = () => {
    setMsg(null);
    setErr(null);
    const map: TaxRateMap = {};
    for (const r of rows) {
      const s = r.state.trim().toUpperCase();
      const n = Number(r.rate);
      if (!s) continue;
      if (s.length !== 2) {
        setErr(`"${s}" is not a 2-letter state code`);
        return;
      }
      if (!Number.isFinite(n) || n < 0) {
        setErr(`Rate for ${s} is invalid`);
        return;
      }
      map[s] = String(n);
    }
    startTransition(async () => {
      const res = await saveTaxRates(map);
      if (res.ok) setMsg("Saved.");
      else setErr(res.error);
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-brand-600">
            No tax rates configured. Click &quot;Add state&quot; to start.
          </p>
        )}
        {rows.map((r, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="w-20">
              <Label className="mb-1.5 block text-xs">State</Label>
              <Input
                value={r.state}
                onChange={(e) =>
                  updateRow(i, { state: e.target.value.toUpperCase().slice(0, 2) })
                }
                maxLength={2}
                placeholder="WA"
              />
            </div>
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs">Rate (%)</Label>
              <Input
                value={r.rate}
                onChange={(e) => updateRow(i, { rate: e.target.value })}
                inputMode="decimal"
                placeholder="8.8"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="h-10 px-2 text-brand-600 hover:text-accent-500"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addRow}>
          Add state
        </Button>
        <Button type="button" onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save tax rates"}
        </Button>
      </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}

function CategoryForm() {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(
    saveCategory,
    null,
  );
  return (
    <form action={action} className="space-y-3">
      <Field label="Name" required>
        <Input name="name" required />
      </Field>
      <Field label="Slug (optional)">
        <Input name="slug" />
      </Field>
      <Field label="Description">
        <Input name="description" />
      </Field>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Saved.</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add category"}</Button>
    </form>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-lg border border-brand-200 p-6">
      <h2 className="font-semibold text-brand-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: React.ReactNode;
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
