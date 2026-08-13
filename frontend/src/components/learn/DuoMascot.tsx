import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type DuoMascotProps = HTMLAttributes<HTMLDivElement>;

export function DuoMascot({ className, ...props }: DuoMascotProps) {
  return (
    <div className={cn("duo-mascot-wrap", className)} {...props}>
      <svg
        viewBox="0 0 220 200"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Duolingo bird mascot"
        className="duo-mascot h-full w-full"
      >
        <path
          d="M28 106c0-45 36-81 81-81h2c45 0 81 36 81 81v13c0 45-36 81-81 81h-2c-45 0-81-36-81-81v-13Z"
          fill="#58CC02"
        />
        <path
          d="M43 92C29 84 16 89 13 103c-2 8 2 17 10 22m154-33c14-8 27-3 30 11 2 8-2 17-10 22"
          stroke="#46A302"
          strokeWidth="10"
          strokeLinecap="round"
          className="duo-wing-stroke"
        />
        <g className="duo-wing duo-wing-left">
          <path d="M46 73c-18-10-34-3-40 13 19-5 32 2 40 13V73Z" fill="#7DDC39" />
        </g>
        <g className="duo-wing duo-wing-right">
          <path d="M174 73c18-10 34-3 40 13-19-5-32 2-40 13V73Z" fill="#7DDC39" />
        </g>
        <ellipse cx="89" cy="104" rx="24" ry="29" fill="#F7FFF0" />
        <ellipse cx="131" cy="104" rx="24" ry="29" fill="#F7FFF0" />
        <circle cx="91" cy="105" r="8" fill="#17371A" />
        <circle cx="129" cy="105" r="8" fill="#17371A" />
        <circle cx="93" cy="102" r="2.5" fill="#fff" />
        <circle cx="131" cy="102" r="2.5" fill="#fff" />
        <rect
          x="65"
          y="76"
          width="48"
          height="58"
          rx="24"
          fill="#58CC02"
          className="duo-eyelid duo-eyelid-left"
        />
        <rect
          x="107"
          y="76"
          width="48"
          height="58"
          rx="24"
          fill="#58CC02"
          className="duo-eyelid duo-eyelid-right"
        />
        <path
          d="m95 130 16-10 16 10-16 13-16-13Z"
          fill="#FFC800"
          stroke="#C88E00"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
