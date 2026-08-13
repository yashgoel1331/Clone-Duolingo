import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "./Button";

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Recoverable error message with an optional retry action. */
export function ErrorState({
  className,
  description = "Something went wrong. Please try again.",
  icon = <CircleAlert size={40} />,
  onRetry,
  retryLabel = "Try again",
  title = "Unable to load",
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 border-heart p-8 text-center",
        className,
      )}
      {...props}
    >
      <span className="mb-3 text-heart" aria-hidden="true">
        {icon}
      </span>
      <h2 className="text-lg font-bold text-text">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-text-muted">{description}</p>
      {onRetry && (
        <Button className="mt-5" variant="danger" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
