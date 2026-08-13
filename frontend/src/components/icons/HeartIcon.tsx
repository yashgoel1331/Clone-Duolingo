import type { SVGProps } from "react";

export interface HeartIconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function HeartIcon({ title, ...props }: HeartIconProps) {
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
        d="M48 87C36 77 11 60 9 37 7 20 18 9 33 10c7 0 12 4 15 10 4-6 9-10 16-10 15-1 26 10 23 27-3 23-27 40-39 50Z"
        fill="#FF4B62"
        stroke="#A91838"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M19 36c0-9 5-16 13-17"
        stroke="#FF9EAA"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M25 53c5 9 13 16 23 23"
        stroke="#E92D4D"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
