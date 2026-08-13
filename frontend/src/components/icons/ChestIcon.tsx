import type { SVGProps } from "react";

export interface ChestIconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function ChestIcon({ title, ...props }: ChestIconProps) {
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
        d="M15 42V31c0-14 11-24 25-24h16c14 0 25 10 25 24v11"
        fill="#B86A2E"
        stroke="#713B1E"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M9 38h78v44c0 5-4 9-9 9H18c-5 0-9-4-9-9V38Z"
        fill="#D98235"
        stroke="#713B1E"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path d="M12 43h72v16H12V43Z" fill="#F5B83B" />
      <path
        d="M8 42h80M30 41v49m36-49v49"
        stroke="#FFD45A"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <rect x="36" y="51" width="24" height="27" rx="6" fill="#71411F" />
      <circle cx="48" cy="61" r="5" fill="#FFE26A" />
      <path d="m44 72 4-12 4 12H44Z" fill="#FFE26A" />
      <path
        d="M20 24c4-7 11-10 20-10h16c9 0 16 3 20 10"
        stroke="#ECA44C"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
