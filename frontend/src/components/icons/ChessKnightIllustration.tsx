import type { SVGProps } from "react";

export interface ChessKnightIllustrationProps
  extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function ChessKnightIllustration({
  title,
  ...props
}: ChessKnightIllustrationProps) {
  return (
    <svg
      viewBox="0 0 180 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M51 155h80l18 24H31l20-24Z"
        fill="#54708A"
        stroke="#263B4D"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M60 129h62l9 28H51l9-28Z"
        fill="#6F8BA3"
        stroke="#263B4D"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M69 129c4-17 1-29-10-39-9-8-11-21-5-33 8-18 27-33 52-43l-1 25c18 9 29 27 28 48-1 17-8 31-18 42H69Z"
        fill="#7E9AB1"
        stroke="#263B4D"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m106 14 20 27-21-2"
        fill="#66839C"
        stroke="#263B4D"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M61 59c17 0 31 9 37 21L73 93"
        fill="#7E9AB1"
        stroke="#263B4D"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="91" cy="51" r="7" fill="#F8D34A" stroke="#263B4D" strokeWidth="4" />
      <circle cx="93" cy="49" r="2" fill="white" />
      <path
        d="M64 117c17 6 38 6 58-1"
        stroke="#AFC5D6"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M43 178h96"
        stroke="#93AABC"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M140 55v24m-12-12h24"
        stroke="#8E7CFF"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
