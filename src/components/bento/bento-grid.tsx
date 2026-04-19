"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BentoGridProps = HTMLAttributes<HTMLDivElement> & {
  columns?: 2 | 3 | 4 | 6 | 12;
  gap?: "tight" | "normal" | "loose";
  children: ReactNode;
};

const COLUMN_CLASSES: Record<NonNullable<BentoGridProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  12: "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12",
};

const GAP_CLASSES: Record<NonNullable<BentoGridProps["gap"]>, string> = {
  tight: "gap-3",
  normal: "gap-4",
  loose: "gap-6",
};

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(function BentoGrid(
  { columns = 12, gap = "normal", className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "grid auto-rows-[minmax(120px,auto)]",
        COLUMN_CLASSES[columns],
        GAP_CLASSES[gap],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
