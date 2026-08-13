import type { SVGProps } from "react";

export interface MascotFlourishProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function MascotFlourish({
  title,
  ...props
}: MascotFlourishProps) {
  return (
    <svg
      viewBox="0 0 180 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M31 25c19-12 45-15 67-8 26 8 46 30 48 56 2 21-8 41-25 53-15 11-35 15-54 10l-28 11 7-27C31 107 23 87 25 67c1-17 8-32 20-43"
        fill="#58CC02"
      />
      <path
        d="M43 38 25 18c-5-6-14 0-11 7l12 30m103-17 20-20c6-6 14 1 10 8l-18 29"
        fill="#58CC02"
        stroke="#46A302"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M56 69c0-13 9-23 21-23s21 10 21 23v5c0 13-9 23-21 23S56 87 56 74v-5Z"
        fill="#F7FFF0"
      />
      <path
        d="M91 69c0-13 9-23 21-23s21 10 21 23v5c0 13-9 23-21 23S91 87 91 74v-5Z"
        fill="#F7FFF0"
      />
      <circle cx="79" cy="73" r="7" fill="#18351B" />
      <circle cx="110" cy="73" r="7" fill="#18351B" />
      <circle cx="81" cy="70" r="2.5" fill="white" />
      <circle cx="112" cy="70" r="2.5" fill="white" />
      <path
        d="M76 103c9 9 26 10 37 0"
        stroke="#18351B"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M28 75c-15 4-22 15-19 29 2 9 10 15 19 16m118-45c15 4 22 15 19 29-2 9-10 15-19 16"
        stroke="#46A302"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
