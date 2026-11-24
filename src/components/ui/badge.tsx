import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#4E5E07] text-[#D8D2CF]",
        secondary:
          "border-[#8D8179]/40 bg-[#8D8179]/20 text-[#2E3604]",
        amber:
          "border-[#2E3604]/20 bg-[#E19D29] text-[#2E3604] font-bold",
        dark:
          "border-[#E19D29]/40 bg-[#2E3604] text-[#E19D29]",
        outline:
          "border-[#4E5E07] text-[#2E3607]",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
