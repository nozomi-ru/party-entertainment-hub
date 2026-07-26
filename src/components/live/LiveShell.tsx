"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLiveGame, type LiveGameId } from "@/lib/live/catalog";
import { makeRoomCode, parseRoomParam } from "@/lib/live/room-code";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { LiveGamePanel } from "@/components/live/LiveGamePanel";

export type LiveRole = "guest" | "screen" | "admin";

type Props = {
  game: LiveGameId;
  role: LiveRole;
};

export function LiveShell({ game, role }: Props) {
  const meta = getLiveGame(game);
  const search = useSearchParams();
  const initialRoom = parseRoomParam(search.get("room"));
  const [roomInput, setRoomInput] = useState(initialRoom);
  /** クエリの room はプリフィルのみ。入室ボタンで確定（名前入力のため） */
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  const peerLinks = useMemo(() => {
    if (!room) return null;
    const q = `?room=${room}`;
    return {
      guest: `/live/${game}/guest${q}`,
      screen: `/live/${game}/screen${q}`,
      admin: `/live/${game}/admin${q}`,
    };
  }, [game, room]);

  return (
    <div
      className={
        role === "screen"
          ? "min-h-dvh bg-[var(--ink)] text-white"
          : "min-h-dvh bg-[var(--paper)] text-[var(--ink)]"
      }
    >
      {role !== "screen" && (
        <header className="border-b border-[var(--line)] bg-[var(--surface)]/90">
          <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-3 px-4 py-3">
            <Link
              href={`/${role}`}
              className="font-[family-name:var(--font-display)] text-lg tracking-wide"
            >
              {siteConfig.name}
            </Link>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {meta.short} · {role}
            </span>
          </div>
        </header>
      )}

      <main
        className={
          role === "screen"
            ? "mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-10"
            : "mx-auto max-w-3xl px-4 py-8"
        }
      >
        {role !== "screen" && (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">
              {meta.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{meta.description}</p>
          </>
        )}

        {!room && (
          <section className="mt-8 space-y-4 rounded-sm border border-[var(--line)] bg-[var(--surface)] p-5">
            <label className="block text-sm">
              ルームコード（4文字）
              <input
                className="mt-2 w-full border border-[var(--line)] bg-white px-3 py-3 text-lg tracking-[0.3em] uppercase"
                value={roomInput}
                maxLength={4}
                onChange={(e) =>
                  setRoomInput(parseRoomParam(e.target.value))
                }
                data-testid="room-input"
              />
            </label>
            {role === "guest" && (
              <label className="block text-sm">
                表示名（任意）
                <input
                  className="mt-2 w-full border border-[var(--line)] bg-white px-3 py-3 text-lg"
                  value={name}
                  maxLength={20}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="name-input"
                />
              </label>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="bg-[var(--ink)] px-5 py-3 text-white disabled:opacity-40"
                disabled={roomInput.length !== 4}
                onClick={() => setRoom(roomInput)}
                data-testid="enter-room"
              >
                入室する
              </button>
              {role === "admin" && (
                <button
                  type="button"
                  className="border border-[var(--line)] px-5 py-3"
                  onClick={() => {
                    const code = makeRoomCode();
                    setRoomInput(code);
                    setRoom(code);
                  }}
                  data-testid="create-room"
                >
                  ルームを作成
                </button>
              )}
            </div>
          </section>
        )}

        {room && (
          <>
            {role === "admin" && peerLinks && (
              <div className="mt-6 space-y-2 border border-[var(--line)] bg-[var(--surface)] p-4 text-sm">
                <p>
                  ルーム:{" "}
                  <strong className="tracking-[0.2em]" data-testid="room-code">
                    {room}
                  </strong>
                </p>
                <p className="break-all text-[var(--muted)]">
                  Guest: {peerLinks.guest}
                </p>
                <p className="break-all text-[var(--muted)]">
                  Screen: {peerLinks.screen}
                </p>
              </div>
            )}
            <div className="mt-6">
              <LiveGamePanel
                game={game}
                role={role}
                room={room}
                displayName={name}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
