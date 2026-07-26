"use client";

import useSWR from "swr";
import type { LiveGameId } from "@/lib/live/catalog";
import type { LiveSnapshot } from "@/lib/live/types";

const fetcher = async (url: string): Promise<LiveSnapshot> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export function useLiveRoom(game: LiveGameId, room: string | null) {
  const key =
    room && room.length === 4 ? `/api/live/${game}/${room}` : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: true,
  });

  async function admin(op: string, extra: Record<string, unknown> = {}) {
    if (!room) return;
    const res = await fetch(`/api/live/${game}/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin", op, ...extra }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "admin failed");
    await mutate(json, { revalidate: false });
    return json as LiveSnapshot;
  }

  async function guest(
    kind: string,
    payload: Record<string, unknown>,
    guestId: string,
    name?: string,
  ) {
    if (!room) return;
    const res = await fetch(`/api/live/${game}/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "guest", kind, payload, guestId, name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "guest failed");
    await mutate(json, { revalidate: false });
    return json as LiveSnapshot;
  }

  return { snapshot: data, error, isLoading, mutate, admin, guest };
}
