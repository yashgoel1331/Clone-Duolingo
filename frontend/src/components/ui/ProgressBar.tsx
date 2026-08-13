import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ProgressBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  max?: number;
  tone?: "green" | "gold";
  label?: string;
  trailingIcon?: ReactNode;
}

/** Determinate progress bar with native progressbar semantics. */
export function ProgressBar({
  "aria-label": ariaLabel,
  className,
  label,
  max = 100,
  tone = "green",
  trailingIcon,
  value,
  ...props
}: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        {...props}
        role="progressbar"
        aria-label={label ?? ariaLabel ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className="h-4 flex-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            tone === "gold" ? "bg-gold" : "bg-green",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {trailingIcon && (
        <span className="shrink-0 text-text-muted" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </div>
  );
}
