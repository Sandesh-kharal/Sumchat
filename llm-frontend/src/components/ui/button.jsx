import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";


const buttonVariants = cva(
  // Base classes applied to every button, regardless of variant:
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // The primary action - solid amber, used for "Send" / "Summarize".
        default: "bg-amber-500 text-slate-950 hover:bg-amber-400",
        // A secondary/neutral action - outlined, low emphasis.
        outline:
          "border border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent",
        // Minimal, no border - for tab-like or icon-only buttons.
        ghost: "text-slate-300 hover:bg-slate-800 bg-transparent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// React.forwardRef lets a parent component get a direct reference to the
// underlying <button> DOM node if it ever needs to (e.g. to call .focus()).
// This is a shadcn convention you'll see on every component.
const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
