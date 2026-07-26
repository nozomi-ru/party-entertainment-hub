"use client";

import useSWR from "swr";
import type { DressPublicSnapshot } from "@/lib/dress/store";

const fetcher = async (url: string): Promise<DressPublicSnapshot> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load dress state");
  return res.json();
};

export function useDressState() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/dress/state",
    fetcher,
    {
      refreshInterval: 1500,
      revalidateOnFocus: true,
    },
  );

  return {
    snapshot: data ?? null,
    error,
    isLoading,
    mutate,
  };
}

export async function postDressVote(body: {
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
  status: "voting" | "closed" | "result";
  correct_color?: string;
}): Promise<DressPublicSnapshot> {
  const res = await fetch("/api/dress/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Admin failed");
  }
  return res.json();
}
