import type { ReactNode } from "react";
import Link from "next/link";

function Ornament() {
  return (
    <div className="dress-ornament" aria-hidden>
      <svg viewBox="0 0 28 22" xmlns="http://www.w3.org/2000/svg" width="22" height="17">
        <path
          d="M4 10 L8 4 L14 8 L20 4 L24 10 L22 18 H6 Z"
          fill="none"
          stroke="#b4975a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <text
          x="14"
          y="15.5"
          textAnchor="middle"
          fill="#b4975a"
          fontFamily="Playfair Display, serif"
          fontSize="8"
          fontWeight="600"
        >
          Q
        </text>
      </svg>
    </div>
  );
}

type Props = {
  titleEn: string;
  subtitle?: string;
  lead?: string;
  children: ReactNode;
  /** フルスクリーン演出時はカード枠を外す */
  bare?: boolean;
  navHref?: string;
  navLabel?: string;
  wide?: boolean;
};

/**
 * 人間ビンゴ（app-tools）と同じ紙×金のカード枠。
 */
export function DressFrame({
  titleEn,
  subtitle,
  lead,
  children,
  bare = false,
  navHref = "/#tools",
  navLabel = "ことほぎ",
  wide = false,
}: Props) {
  if (bare) {
    return <>{children}</>;
  }

  return (
    <div className="dress-app">
      <nav className="dress-nav">
        <Link href={navHref} className="dress-nav-brand">
          {navLabel}
        </Link>
        <Link href="/#tools" className="dress-nav-back">
          ツール一覧
        </Link>
      </nav>
      <div className={`dress-card${wide ? " dress-card--wide" : ""}`}>
        <Ornament />
        <h1 className="dress-title">{titleEn}</h1>
        {subtitle && <p className="dress-subtitle">{subtitle}</p>}
        {lead && <p className="dress-lead">{lead}</p>}
        <div className="dress-body">{children}</div>
      </div>
    </div>
  );
}
