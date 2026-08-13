import type { SVGProps } from "react";

export interface FlameIconProps extends SVGProps<SVGSVGElement> {
  active?: boolean;
  title?: string;
}

export function FlameIcon({
  active = true,
  title,
  ...props
}: FlameIconProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M49 5c7 17 2 24-3 31 12-3 19-11 22-22 14 13 21 30 18 45-3 19-18 32-38 32S11 77 10 57c-1-17 8-33 23-45 0 13 5 21 11 26 0-10 1-22 5-33Z"
        fill={active ? "#FF7A1A" : "#6E7B86"}
        stroke={active ? "#B63B08" : "#3B4750"}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M50 43c8 10 15 18 13 29-1 9-7 15-15 15s-15-6-16-15c-1-9 4-18 12-27 0 8 2 12 5 15 2-5 2-10 1-17Z"
        fill={active ? "#FFD33D" : "#AAB5BE"}
        stroke={active ? "#E95D0B" : "#56636D"}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M22 52c-3 11 0 21 8 28"
        stroke={active ? "#FFAD28" : "#8D99A3"}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
