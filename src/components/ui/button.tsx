import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E19D29] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#4E5E07] text-[#D8D2CF] hover:bg-[#2E3604] hover:text-white shadow-md shadow-[#2E3604]/20 border border-[#E19D29]/20",
        amber:
          "bg-[#E19D29] text-[#2E3604] font-semibold hover:bg-[#e8ab42] shadow-md shadow-[#E19D29]/25 border border-[#2E3604]/15",
        dark:
          "bg-[#2E3604] text-[#D8D2CF] hover:bg-[#3c4706] border border-[#4E5E07]",
        outline:
          "border-2 border-[#4E5E07]/40 bg-transparent text-[#2E3604] hover:bg-[#4E5E07]/10 hover:border-[#4E5E07]",
        ghost:
          "text-[#2E3604] hover:bg-[#4E5E07]/12",
        muted:
          "bg-[#8D8179]/20 text-[#2E3604] hover:bg-[#8D8179]/35 border border-[#8D8179]/40",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
