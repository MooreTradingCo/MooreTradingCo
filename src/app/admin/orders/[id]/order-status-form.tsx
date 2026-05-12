"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrderStatus, type AdminResult } from "@/server/actions/admin";

export function OrderStatusForm({
  id,
  status,
  trackingNumber,
}: {
  id: number;
  status: string;
  trackingNumber: string;
}) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(
    updateOrderStatus,
    null,
  );
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <Label htmlFor="status" className="mb-1.5 block">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <div>
        <Label htmlFor="tracking" className="mb-1.5 block">Tracking number</Label>
        <Input id="tracking" name="trackingNumber" defaultValue={trackingNumber} />
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Updated.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
