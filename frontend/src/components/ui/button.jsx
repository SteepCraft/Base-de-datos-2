import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:-translate-y-px hover:bg-primary/90 hover:shadow",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-px hover:bg-secondary/80 hover:shadow",
        outline:
          "border-border bg-card text-foreground shadow-sm hover:-translate-y-px hover:bg-accent hover:text-accent-foreground hover:shadow",
        ghost:
          "text-foreground hover:border-border hover:bg-accent/80 hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-px hover:bg-destructive/90 hover:shadow",
        danger:
          "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-px hover:bg-destructive/90 hover:shadow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
