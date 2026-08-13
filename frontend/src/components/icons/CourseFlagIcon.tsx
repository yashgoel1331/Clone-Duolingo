import type { SVGProps } from "react";

export interface CourseFlagIconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function CourseFlagIcon({ title, ...props }: CourseFlagIconProps) {
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
        d="M22 88V11"
        stroke="#C6D3DD"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="22" cy="10" r="8" fill="#EAF3F8" stroke="#738795" strokeWidth="4" />
      <path
        d="M27 18h51c4 0 6 5 3 8L69 40l12 15c3 4 0 9-4 9H27V18Z"
        fill="#4A7DFF"
        stroke="#254EB2"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="m50 29 4 7 8 1-6 6 1 9-7-4-7 4 1-9-6-6 8-1 4-7Z"
        fill="#DCE8FF"
        stroke="#254EB2"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 23h39"
        stroke="#7FA5FF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M10 89h28"
        stroke="#738795"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
