"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

interface ToastRecord extends Required<Pick<ToastOptions, "message" | "variant">> {
  id: string;
  title?: string;
  duration: number;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (item.duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [item.duration, item.id, onDismiss]);

  return (
    <div
      role={item.variant === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border-2 bg-card p-4 text-text shadow-lg",
        item.variant === "success" && "border-green",
        item.variant === "error" && "border-heart",
        item.variant === "info" && "border-blue",
      )}
    >
      <div className="min-w-0 flex-1">
        {item.title && <p className="font-bold">{item.title}</p>}
        <p className="text-sm text-text-muted">{item.message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded p-1 text-text-muted focus-visible:outline-2 focus-visible:outline-blue"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
}

/** Provides transient notifications through the useToast hook. */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = `toast-${++nextToastId}`;
    setToasts((current) => [
      ...current,
      {
        id,
        message: options.message,
        title: options.title,
        variant: options.variant ?? "info",
        duration: options.duration ?? 4000,
      },
    ]);
    return id;
  }, []);

  const value = useMemo(() => ({ dismiss, toast }), [dismiss, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-4 z-60 flex w-[min(24rem,calc(100%-2rem))] flex-col gap-3"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns notification controls from the nearest ToastProvider. */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return value;
}
