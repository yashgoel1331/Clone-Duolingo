import type { SVGProps } from "react";

export interface WingedCreatureIllustrationProps
  extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function WingedCreatureIllustration({
  title,
  ...props
}: WingedCreatureIllustrationProps) {
  return (
    <svg
      viewBox="0 0 220 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M75 73C53 45 23 42 8 55c16 3 22 11 25 19-10-1-19 3-24 10 18 0 27 7 34 18-8 1-14 6-17 13 27 1 44-9 57-24"
        fill="#8E7CFF"
        stroke="#4E3AA4"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M145 73c22-28 52-31 67-18-16 3-22 11-25 19 10-1 19 3 24 10-18 0-27 7-34 18 8 1 14 6 17 13-27 1-44-9-57-24"
        fill="#8E7CFF"
        stroke="#4E3AA4"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 87c0-34 19-59 44-59s44 25 44 59v17c0 31-18 54-44 54s-44-23-44-54V87Z"
        fill="#6956D8"
        stroke="#3C2A91"
        strokeWidth="7"
      />
      <path
        d="m78 45-7-25 22 16m49 9 7-25-22 16"
        fill="#6956D8"
        stroke="#3C2A91"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="94" cy="82" rx="18" ry="21" fill="#F8F5FF" />
      <ellipse cx="126" cy="82" rx="18" ry="21" fill="#F8F5FF" />
      <circle cx="97" cy="84" r="7" fill="#241B4E" />
      <circle cx="123" cy="84" r="7" fill="#241B4E" />
      <circle cx="99" cy="81" r="2.5" fill="white" />
      <circle cx="125" cy="81" r="2.5" fill="white" />
      <path
        d="m100 105 10-7 10 7-10 9-10-9Z"
        fill="#FFC83D"
        stroke="#9B6511"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M88 129c13 9 31 9 44 0"
        stroke="#A99CFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="m90 155-11 9m51-9 11 9"
        stroke="#3C2A91"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
