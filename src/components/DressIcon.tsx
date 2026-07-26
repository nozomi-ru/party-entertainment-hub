import type { SVGProps } from "react";

type Props = {
  color: string;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "color">;

/**
 * 線画のドレスシルエット。`color` で fill を差し替える。
 */
export function DressIcon({ color, className, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 120 180"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...rest}
    >
      {/* 頭部 */}
      <circle
        cx="60"
        cy="22"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* 首〜肩 */}
      <path
        d="M48 36c2 10 8 14 12 14s10-4 12-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* ドレス本体 */}
      <path
        d="M42 50
           C38 58 34 66 28 78
           C22 92 16 110 14 130
           C12 148 18 162 30 168
           L90 168
           C102 162 108 148 106 130
           C104 110 98 92 92 78
           C86 66 82 58 78 50
           C74 52 66 54 60 54
           C54 54 46 52 42 50Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* ウエストライン */}
      <path
        d="M40 78 C50 82 70 82 80 78"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* 裾のひだ */}
      <path
        d="M28 150 C40 146 50 154 60 150 C70 146 80 154 92 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
