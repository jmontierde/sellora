import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/60",
        secondary: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200/60",
        success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60",
        warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60",
        destructive: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/60",
        outline: "border border-gray-200 text-gray-700",
        solid: "bg-gray-900 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
