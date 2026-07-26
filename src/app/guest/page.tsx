import type { Metadata } from "next";
import Link from "next/link";
import { RoleShell } from "@/components/role/RoleShell";
import { GuestSessionPanel } from "@/components/session/GuestSessionPanel";

export const metadata: Metadata = {
  title: "ゲスト",
  description: "スマホ向けゲスト参加画面の入口です。",
  robots: { index: false, follow: false },
};

const LINKS = [
  {
    href: "/app-tools/wedding-poll/index.html",
    label: "リアルタイムアンケート",
  },
  {
    href: "/app-tools/wedding-bingo/index.html",
    label: "人間ビンゴ",
  },
  {
    href: "/app-tools/wedding-quiz/index.html",
    label: "新郎新婦クイズ",
  },
  {
    href: "/app-tools/wishboard/index.html",
    label: "祝福メッセージ",
  },
] as const;

export default function GuestPage() {
  return (
    <RoleShell
      role="guest"
      title="ゲスト参加"
      description="QR から開いた端末向けの入口です。匿名 ID を自動で保持し、各余興アプリへ進めます。"
    >
      <GuestSessionPanel />
      <ul className="mt-8 space-y-3">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block border-b border-[var(--line)] py-3 text-lg text-[var(--ink)] transition-colors hover:text-[var(--champagne-deep)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </RoleShell>
  );
}
