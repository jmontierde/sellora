import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-900 shadow-xs transition-[border-color,box-shadow] duration-150 resize-y",
          "placeholder:text-gray-400",
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
Textarea.displayName = "Textarea";

export { Textarea };
