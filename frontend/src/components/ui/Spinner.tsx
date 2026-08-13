import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-4",
} as const;

/** Accessible indeterminate loading indicator. */
export function Spinner({
  "aria-label": ariaLabel = "Loading",
  className,
  size = "md",
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-block animate-spin rounded-full border-current border-r-transparent",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
