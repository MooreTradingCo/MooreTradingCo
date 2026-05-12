"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveCategory,
  saveSetting,
  type AdminResult,
} from "@/server/actions/admin";
import type { Category } from "@/db/schema";

export function SettingsForms({
  categories,
  settings,
}: {
  categories: Category[];
  settings: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <Section title="Shipping &amp; tax origin">
        <ShippingForm settings={settings} />
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
