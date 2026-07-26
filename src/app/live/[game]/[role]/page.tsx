import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LiveShell, type LiveRole } from "@/components/live/LiveShell";
import { getLiveGame, isLiveGameId } from "@/lib/live/catalog";

type Props = {
  params: Promise<{ game: string; role: string }>;
};

const ROLES = ["guest", "screen", "admin"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game, role } = await params;
  if (!isLiveGameId(game) || !(ROLES as readonly string[]).includes(role)) {
    return { title: "Live" };
  }
  const meta = getLiveGame(game);
  return {
    title: `${meta.title} (${role})`,
    robots: { index: false, follow: false },
  };
}

export default async function LiveGamePage({ params }: Props) {
  const { game, role } = await params;
  if (!isLiveGameId(game) || !(ROLES as readonly string[]).includes(role)) {
    notFound();
  }
  return (
    <Suspense fallback={<p className="p-8">読み込み中…</p>}>
      <LiveShell game={game} role={role as LiveRole} />
    </Suspense>
  );
}
