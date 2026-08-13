import { cn } from "@/lib/cn";

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

/** Circular determinate progress indicator. */
export function ProgressRing({
  className,
  label = "Progress",
  max = 100,
  size = 72,
  strokeWidth = 8,
  value,
}: ProgressRingProps) {
  const safeMax = Math.max(1, max);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safeValue / safeMax);

  return (
    <svg
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("-rotate-90", className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-green transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}
