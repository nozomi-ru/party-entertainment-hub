import type { ReactNode } from "react";
import Link from "next/link";

function Ornament() {
  return (
    <div className="dress-ornament" aria-hidden>
      <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" />
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
