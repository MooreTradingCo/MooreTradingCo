"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustard-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-forest-900 text-cream hover:bg-forest-700 shadow-sm",
        accent:
          "bg-chili-500 text-cream hover:bg-chili-600 shadow-sm",
        outline:
          "border-2 border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-cream",
        ghost:
          "text-forest-900 hover:bg-stone-200",
        link:
          "text-chili-600 hover:text-chili-700 underline-offset-4 hover:underline",
        destructive:
          "bg-chili-700 text-cream hover:bg-chili-700/90",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-md text-sm",
        sm: "h-8 px-3 rounded-md text-xs",
        lg: "h-12 px-6 rounded-full text-base",
        xl: "h-14 px-8 rounded-full text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
