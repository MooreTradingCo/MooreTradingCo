"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ProductModalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent>
        <DialogTitle className="sr-only">Product details</DialogTitle>
        <DialogDescription className="sr-only">
          Quick view of the selected product.
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
