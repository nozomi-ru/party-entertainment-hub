"use client";

import useSWR from "swr";
import type { DressPublicSnapshot } from "@/lib/dress/store";

const fetcher = async (url: string): Promise<DressPublicSnapshot> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load dress state");
  return res.json();
};

export function useDressState(room: string | null) {
  const key =
    room && room.length === 4
      ? `/api/dress/state?room=${encodeURIComponent(room)}`
      : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: 1500,
    revalidateOnFocus: true,
  });

  return {
    snapshot: data ?? null,
    error,
    isLoading: Boolean(key) && isLoading,
    mutate,
  };
}

export async function postDressVote(body: {
  room: string;
  user_id: string;
  name: string;
  color: string;
}): Promise<DressPublicSnapshot> {
  const res = await fetch("/api/dress/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Vote failed");
  }
  return res.json();
}

export async function postDressAdmin(body: {
  room: string;
  op?: "open" | "setColors" | "extend";
  status?: "voting" | "closed" | "result";
  correct_color?: string;
  colors?: { id?: string; label: string; fill: string; glow?: string }[];
}): Promise<DressPublicSnapshot> {
  const res = await fetch("/api/dress/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    const error = new Error(err.error ?? "Admin failed") as Error & {
      status: number;
    };
    error.status = res.status;
    throw error;
  }
  return res.json();
}
