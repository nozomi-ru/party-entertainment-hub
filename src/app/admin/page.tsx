import type { Metadata } from "next";
import Link from "next/link";
import { RoleShell } from "@/components/role/RoleShell";

export const metadata: Metadata = {
  title: "管理者",
  description: "司会・幹事向け進行パネルの入口です。",
  robots: { index: false, follow: false },
};

const LINKS = [
  {
    href: "/app-tools/wedding-poll/index.html",
    label: "アンケート Host",
    note: "ルーム作成・質問切替・結果公開",
  },
  {
    href: "/app-tools/wedding-quiz/index.html",
    label: "クイズ設定・共有",
    note: "問題セットの編集と共有 URL",
  },
  {
    href: "/app-tools/wedding-bingo/index.html",
    label: "ビンゴ設定・共有",
    note: "マス文言の編集と共有 URL",
  },
  {
    href: "/app-tools/wishboard/index.html",
    label: "祝福メッセージ Host",
    note: "壁の公開・進行",
  },
  {
    href: "/#tools",
    label: "すべてのツール一覧",
    note: "LP の Party Tools へ",
  },
] as const;

export default function AdminPage() {
  return (
    <RoleShell
      role="admin"
      title="管理者"
      description="司会・幹事向けの進行入口です。ルーム作成や結果公開など、会場進行の操作はここから各ツールへ。"
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
