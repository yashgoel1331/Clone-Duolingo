import type { SVGProps } from "react";

export interface TrophyIconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function TrophyIcon({ title, ...props }: TrophyIconProps) {
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
        d="M29 12h38v22c0 18-8 30-19 30S29 52 29 34V12Z"
        fill="#FFC800"
        stroke="#A86500"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M29 22H13v8c0 14 8 23 20 23M67 22h16v8c0 14-8 23-20 23"
        stroke="#F2A900"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M48 63v15" stroke="#A86500" strokeWidth="7" />
      <path
        d="M28 87c0-6 5-10 11-10h18c6 0 11 4 11 10H28Z"
        fill="#FFC800"
        stroke="#A86500"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="m48 22 4 8 9 1-7 7 2 10-8-5-8 5 2-10-7-7 9-1 4-8Z"
        fill="#FFF2A8"
        stroke="#F2A900"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M36 16h24"
        stroke="#FFF2A8"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
