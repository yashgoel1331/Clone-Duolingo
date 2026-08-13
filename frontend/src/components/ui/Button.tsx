import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "locked";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-green bg-green text-white shadow-[0_4px_0_var(--green-dark)] hover:brightness-105",
  secondary:
    "border-blue bg-blue text-white shadow-[0_4px_0_var(--blue-dark)] hover:brightness-105",
  ghost: "border-transparent bg-transparent text-text-link shadow-none hover:bg-nav-active",
  danger:
    "border-heart bg-heart text-white shadow-[0_4px_0_#d93636] hover:brightness-105",
  locked:
    "border-locked bg-locked text-locked-icon shadow-[0_4px_0_#2b3940]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-13 px-7 text-lg",
};

/** Action button with Duolingo-style physical press feedback. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      fullWidth = false,
      loading = false,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading || variant === "locked";

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl border-2 font-black uppercase tracking-[0.7px] transition-[transform,box-shadow,filter,background-color] duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Spinner size="sm" aria-label="Loading" />}
        {children}
      </button>
    );
  },
);
