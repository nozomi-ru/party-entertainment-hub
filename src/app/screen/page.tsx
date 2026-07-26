import type { Metadata } from "next";
import Link from "next/link";
import { RoleShell } from "@/components/role/RoleShell";

export const metadata: Metadata = {
  title: "スクリーン",
  description: "会場プロジェクター向け表示の入口です。",
  robots: { index: false, follow: false },
};

const LINKS = [
  {
    href: "/app-tools/wedding-poll/index.html",
    label: "アンケート（結果表示）",
    note: "Host で結果公開後、会場スクリーンに映す用途",
  },
  {
    href: "/app-tools/bingo-machine/index.html",
    label: "ビンゴ数字抽選機",
    note: "プロジェクター全画面向け",
  },
  {
    href: "/app-tools/countdown/index.html",
    label: "カウントダウン",
    note: "会場タイマー",
  },
  {
    href: "/app-tools/roulette/index.html",
    label: "抽選ルーレット",
    note: "会場映し出し向け",
  },
] as const;

export default function ScreenPage() {
  return (
    <RoleShell
      role="screen"
      title="スクリーン"
      description="会場プロジェクター用の入口です。操作は最小にし、各ツールを全画面表示して使います。"
    >
      <ul className="space-y-5">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block text-xl text-[var(--ink)] transition-colors hover:text-[var(--champagne-deep)]"
            >
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.note}</p>
          </li>
        ))}
      </ul>
    </RoleShell>
  );
}
