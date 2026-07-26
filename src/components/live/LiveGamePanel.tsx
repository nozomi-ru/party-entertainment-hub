"use client";

import { useState } from "react";
import type { LiveRole } from "@/components/live/LiveShell";
import { useGuestSession } from "@/hooks/use-guest-session";
import { useLiveRoom } from "@/hooks/use-live-room";
import type { LiveGameId } from "@/lib/live/catalog";

type Props = {
  game: LiveGameId;
  role: LiveRole;
  room: string;
  displayName: string;
};

/** 汎用 live パネル（現行カタログに専用外ゲームがないためプレースホルダ） */
export function LiveGamePanel({ game, role, room, displayName }: Props) {
  const { ready } = useGuestSession();
  const { error, isLoading } = useLiveRoom(game, room);
  const [msg] = useState("");
  void role;
  void displayName;
  void ready;

  if (isLoading) {
    return <p className="text-[var(--muted)]">同期中…</p>;
  }
  if (error) {
    return <p className="text-red-700">読み込みに失敗しました</p>;
  }

  return (
    <div>
      {msg && (
        <p className="mb-3 text-sm text-red-700" data-testid="live-error">
          {msg}
        </p>
      )}
      <p className="text-sm text-[var(--muted)]">
        このゲームは専用アプリへ移行しました。カタログから開き直してください。
      </p>
    </div>
  );
}
