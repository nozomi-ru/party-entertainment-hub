import type { Metadata } from "next";
import Link from "next/link";
import { RoleShell } from "@/components/role/RoleShell";
import { LIVE_GAMES, liveRolePath } from "@/lib/live/catalog";

export const metadata: Metadata = {
  title: "管理者",
  description: "司会・幹事向け進行パネルの入口です。",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <RoleShell
      role="admin"
      title="管理者"
      description="司会・幹事向けの進行入口です。ルームを作成し、各ライブ余興の進行をコントロールします。"
    >
      <ul className="space-y-5">
        {LIVE_GAMES.map((item) => (
          <li key={item.id}>
            <Link
              href={liveRolePath(item.id, "admin")}
              className="block text-xl text-[var(--ink)] transition-colors hover:text-[var(--champagne-deep)]"
            >
              {item.title}
            </Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-[var(--muted)]">
        従来の静的ツールは{" "}
        <Link href="/#tools" className="underline">
          LP の Party Tools
        </Link>{" "}
        から開けます。
      </p>
    </RoleShell>
  );
}
