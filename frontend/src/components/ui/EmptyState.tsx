import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** Centered placeholder for a collection with no content. */
export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 border-dashed border-border p-8 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="mb-3 text-text-muted" aria-hidden="true">
          {icon}
        </span>
      )}
      <h2 className="text-lg font-bold text-text">{title}</h2>
      {description && (
        <p className="mt-1 max-w-md text-sm text-text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
