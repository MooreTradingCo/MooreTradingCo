"use client";

import { useState, useTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAddress, deleteAddress, type ActionResult } from "@/server/actions/account";
import type { Address } from "@/db/schema";

export function AddressManager({ initial }: { initial: Address[] }) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {initial.length === 0 && editing !== "new" && (
        <p className="text-brand-700">No addresses saved yet.</p>
      )}

      {initial.map((a) =>
        editing === a.id ? (
          <AddressForm
            key={a.id}
            initial={a}
            onCancel={() => setEditing(null)}
            onDone={() => setEditing(null)}
          />
        ) : (
          <div
            key={a.id}
            className="bg-white rounded-lg border border-brand-200 p-4 flex justify-between gap-4"
          >
            <div>
              <p className="font-medium text-brand-900">
                {a.label || a.fullName}{" "}
                {a.isDefault && (
                  <span className="ml-2 text-xs text-brand-600">Default</span>
                )}
              </p>
              <address className="not-italic text-sm text-brand-700 leading-snug mt-1">
                {a.fullName}<br />
                {a.line1}<br />
                {a.line2 && <>{a.line2}<br /></>}
                {a.city}, {a.region} {a.postalCode}
              </address>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button
                className="text-sm text-brand-700 hover:text-accent-500"
                onClick={() => setEditing(a.id)}
              >
                Edit
              </button>
              <button
                disabled={pending}
                className="text-sm text-red-600 hover:underline"
                onClick={() => startTransition(() => deleteAddress(a.id).then(() => {}))}
              >
                Delete
              </button>
            </div>
          </div>
        ),
      )}

      {editing === "new" ? (
        <AddressForm onCancel={() => setEditing(null)} onDone={() => setEditing(null)} />
      ) : (
        <Button variant="outline" onClick={() => setEditing("new")}>
          Add new address
        </Button>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onCancel,
  onDone,
}: {
  initial?: Address;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const result = await saveAddress(prev, fd);
      if (result.ok) onDone();
      return result;
    },
    null,
  );

  return (
    <form action={action} className="bg-white rounded-lg border border-brand-200 p-4 space-y-3">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Label (Home / Work)">
          <Input name="label" defaultValue={initial?.label ?? ""} />
        </Field>
        <Field label="Full name" required>
          <Input name="fullName" required defaultValue={initial?.fullName ?? ""} />
        </Field>
      </div>
      <Field label="Address line 1" required>
        <Input name="line1" required defaultValue={initial?.line1 ?? ""} />
      </Field>
      <Field label="Address line 2">
        <Input name="line2" defaultValue={initial?.line2 ?? ""} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="City" required>
          <Input name="city" required defaultValue={initial?.city ?? ""} />
        </Field>
        <Field label="State" required>
          <Input name="region" required maxLength={2} defaultValue={initial?.region ?? ""} />
        </Field>
        <Field label="ZIP" required>
          <Input name="postalCode" required defaultValue={initial?.postalCode ?? ""} />
        </Field>
      </div>
      <Field label="Phone">
        <Input name="phone" type="tel" defaultValue={initial?.phone ?? ""} />
      </Field>
      <label className="inline-flex items-center gap-2 text-sm text-brand-800">
        <input type="checkbox" name="isDefault" defaultChecked={initial?.isDefault} />
        Set as default
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
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
      <Label>{label}{required && <span className="text-red-600"> *</span>}</Label>
      {children}
    </div>
  );
}
