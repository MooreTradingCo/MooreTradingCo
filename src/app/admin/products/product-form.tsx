"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveProduct,
  deleteProduct,
  deleteProductImage,
  type AdminResult,
} from "@/server/actions/admin";
import type { Product, ProductImage, Category } from "@/db/schema";

export function ProductForm({
  product,
  images = [],
  categories,
}: {
  product?: Product;
  images?: ProductImage[];
  categories: Category[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<
    AdminResult<{ id: number }> | null,
    FormData
  >(async (prev, fd) => {
    const result = await saveProduct(prev, fd);
    if (result.ok && !product) router.push(`/admin/products/${result.id}`);
    return result;
  }, null);

  const [deleting, startDeleting] = useTransition();

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Basics">
        <Field label="Name" required>
          <Input name="name" required defaultValue={product?.name ?? ""} />
        </Field>
        <Field label="Short description (shown on cards)">
          <Input name="shortDescription" defaultValue={product?.shortDescription ?? ""} maxLength={280} />
        </Field>
        <Field label="Description">
          <Textarea name="description" rows={5} defaultValue={product?.description ?? ""} />
        </Field>
        <Field label="Ingredients">
          <Textarea name="ingredients" rows={3} defaultValue={product?.ingredients ?? ""} />
        </Field>
      </Section>

      <Section title="Pricing &amp; inventory">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Price (cents)" required>
            <Input name="priceCents" type="number" min={0} required defaultValue={product?.priceCents ?? 0} />
          </Field>
          <Field label="Weight (oz)">
            <Input name="weightOz" type="number" min={0} defaultValue={product?.weightOz ?? 4} />
          </Field>
          <Field label="Stock">
            <Input name="stockQty" type="number" min={0} defaultValue={product?.stockQty ?? 0} />
          </Field>
          <Field label="SKU">
            <Input name="sku" defaultValue={product?.sku ?? ""} />
          </Field>
        </div>
        <Field label="Category">
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product ? product.isActive : true}
            />
            Active (visible on store)
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
            />
            Featured on home
          </label>
        </div>
      </Section>

      <Section title="Images">
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded overflow-hidden border border-brand-200"
              >
                <Image src={img.url} alt={img.alt ?? ""} fill sizes="160px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => deleteProductImage(img.id, img.url)}
                  className="absolute top-1 right-1 text-xs bg-charcoal/70 text-cream px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="text-sm"
        />
        <p className="text-xs text-brand-600 mt-1">
          PNG or JPG. Uploaded to Vercel Blob storage.
        </p>
      </Section>

      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/admin/products">Cancel</Link>
        </Button>
        {product && (
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={() =>
              startDeleting(async () => {
                await deleteProduct(product.id);
                router.push("/admin/products");
              })
            }
          >
            Deactivate
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg border border-brand-200 p-6 space-y-3">
      <h2 className="font-semibold text-brand-900">{title}</h2>
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
