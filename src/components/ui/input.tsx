import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 shadow-xs transition-[border-color,box-shadow] duration-150",
          "placeholder:text-gray-400",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/12",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
