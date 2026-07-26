import type { Metadata } from "next";
import Link from "next/link";
import { RoleShell } from "@/components/role/RoleShell";
import { LIVE_GAMES, liveRolePath } from "@/lib/live/catalog";

export const metadata: Metadata = {
  title: "スクリーン",
  description: "会場プロジェクター向け表示の入口です。",
  robots: { index: false, follow: false },
};

export default function ScreenPage() {
  return (
    <RoleShell
      role="screen"
      title="スクリーン"
      description="会場プロジェクター用の入口です。ルームに入室後、操作なしで結果を映します。"
    >
      <ul className="space-y-5">
        {LIVE_GAMES.map((item) => (
          <li key={item.id}>
            <Link
              href={liveRolePath(item.id, "screen")}
              className="block text-xl text-[var(--ink)] transition-colors hover:text-[var(--champagne-deep)]"
            >
              {item.title}
            </Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
          </li>
        ))}
      </ul>
    </RoleShell>
  );
}
