import type { Metadata } from "next";
import Link from "next/link";
import { RoleShell } from "@/components/role/RoleShell";
import { GuestSessionPanel } from "@/components/session/GuestSessionPanel";
import { LIVE_GAMES } from "@/lib/live/catalog";

export const metadata: Metadata = {
  title: "ゲスト",
  description: "スマホ向けゲスト参加画面の入口です。",
  robots: { index: false, follow: false },
};

const LEGACY = [
  {
    href: "/app-tools/wedding-poll/index.html",
    label: "リアルタイムアンケート（従来版）",
  },
  {
    href: "/app-tools/wedding-bingo/index.html",
    label: "人間ビンゴ（従来版）",
  },
  {
    href: "/app-tools/wedding-quiz/index.html",
    label: "新郎新婦クイズ（従来版）",
  },
] as const;

export default function GuestPage() {
  return (
    <RoleShell
      role="guest"
      title="ゲスト参加"
      description="QR から開いた端末向けの入口です。匿名 ID を自動で保持し、ライブ余興へ進めます。"
    >
      <GuestSessionPanel />
      <h2 className="mt-10 text-sm tracking-[0.2em] text-[var(--muted)] uppercase">
        Live Games
      </h2>
      <ul className="mt-3 space-y-3">
        {LIVE_GAMES.map((item) => (
          <li key={item.id}>
            <Link
              href={`/live/${item.id}/guest`}
              className="block border-b border-[var(--line)] py-3 text-lg text-[var(--ink)] transition-colors hover:text-[var(--champagne-deep)]"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-sm tracking-[0.2em] text-[var(--muted)] uppercase">
        Classic Tools
      </h2>
      <ul className="mt-3 space-y-3">
        {LEGACY.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block border-b border-[var(--line)] py-3 text-base text-[var(--muted)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </RoleShell>
  );
}
