import type { SVGProps } from "react";

export interface SleepingAnimalIllustrationProps
  extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function SleepingAnimalIllustration({
  title,
  ...props
}: SleepingAnimalIllustrationProps) {
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M30 132c0-35 27-61 66-61h34c35 0 62 23 62 54 0 14-9 25-25 25H55c-16 0-25-7-25-18Z"
        fill="#B87543"
        stroke="#633A28"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M48 87 35 57c-3-8 6-15 13-10l27 18m82 19 21-26c5-7 15-2 13 6l-8 34"
        fill="#B87543"
        stroke="#633A28"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 93c6-19 23-31 44-31h26c28 0 48 18 48 43 0 21-17 37-40 37H85c-25 0-40-20-33-49Z"
        fill="#C98852"
      />
      <path
        d="M72 108c8 7 18 7 26 0m20 0c8 7 18 7 26 0"
        stroke="#43261E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="m101 119 9-5 9 5-9 7-9-7Z"
        fill="#513029"
        stroke="#43261E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M110 126c0 6 5 9 12 8"
        stroke="#43261E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M45 123c-18-3-30 2-35 15 13-5 24-2 32 8"
        fill="#A7653D"
        stroke="#633A28"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M61 78c7-6 14-9 22-11"
        stroke="#E0A16E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M168 21h28l-27 30h29M143 8h20l-19 22h20"
        stroke="#8E7CFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M68 150h100"
        stroke="#34261F"
        strokeWidth="8"
        strokeLinecap="round"
        opacity=".45"
      />
    </svg>
  );
}
