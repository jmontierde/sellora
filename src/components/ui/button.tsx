import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-tight transition-[transform,background,box-shadow,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_1px_0_0_rgb(255_255_255_/_0.18)_inset,0_1px_2px_0_rgb(79_70_229_/_0.30)] hover:from-indigo-500 hover:to-indigo-700 hover:shadow-[0_1px_0_0_rgb(255_255_255_/_0.18)_inset,0_4px_12px_-2px_rgb(79_70_229_/_0.40)]",
        destructive:
          "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_1px_0_0_rgb(255_255_255_/_0.18)_inset,0_1px_2px_0_rgb(225_29_72_/_0.30)] hover:from-rose-500 hover:to-rose-700",
        outline:
          "border border-gray-200 bg-white text-gray-800 shadow-xs hover:bg-gray-50 hover:border-gray-300",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200/80",
        ghost: "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900",
        link: "text-indigo-600 underline-offset-4 hover:underline h-auto p-0",
        glass:
          "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-sm",
        xl: "h-12 rounded-xl px-7 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
