import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  action?: ReactNode;
}

/** Bordered content surface with an optional header action. */
export function Card({
  action,
  children,
  className,
  title,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border-2 border-border/90 bg-card p-5 text-text shadow-[0_3px_0_#1a2a31]",
        className,
      )}
      {...props}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-xl font-black">{title}</h2>}
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
