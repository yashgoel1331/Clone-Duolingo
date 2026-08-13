import type { SVGProps } from "react";

export interface GemIconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function GemIcon({ title, ...props }: GemIconProps) {
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
        d="M19 16h58l13 25-42 45L6 41l13-25Z"
        fill="#25D7E7"
        stroke="#087E9C"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="m19 17 12 24 17-24 17 24 12-24M8 41h80M31 41l17 44 17-44"
        stroke="#079BBC"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="m34 22-7 14m29-14 7 14M19 47l24 26"
        stroke="#A9F8FF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="m73 47-15 16"
        stroke="#4BEAF3"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
