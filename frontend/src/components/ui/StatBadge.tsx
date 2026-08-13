import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface StatBadgeProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  color?: "green" | "blue" | "gold";
}

/** Compact labeled statistic with an optional decorative icon. */
export function StatBadge({
  "aria-label": ariaLabel,
  className,
  color = "blue",
  icon,
  label,
  value,
  ...props
}: StatBadgeProps) {
  return (
    <div
      aria-label={ariaLabel ?? `${label}: ${String(value)}`}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 rounded-2xl border border-border/70 bg-bg-secondary/45 px-2 py-1",
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            color === "green" && "text-green",
            color === "blue" && "text-blue",
            color === "gold" && "text-gold",
          )}
        >
          {icon}
        </span>
      )}
      <span className="sr-only">{label}</span>
      <span className="leading-none text-[15px] font-black text-text">{value}</span>
    </div>
  );
}
