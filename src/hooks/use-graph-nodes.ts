"use client";

import useSWR from "swr";
import type { GraphNodeRecord } from "@/lib/graph/types";
import type { GraphVizData } from "@/lib/graph/types";

export type GraphNodesResponse = {
  room: string;
  nodes: GraphNodeRecord[];
  graph: GraphVizData;
  node?: GraphNodeRecord;
  deleted?: number;
  expiresAt?: number;
  createdAt?: number;
};

const fetcher = async (url: string): Promise<GraphNodesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load graph nodes");
  return res.json();
};

export function useGraphNodes(room: string | null) {
  const key =
    room && room.length === 4
      ? `/api/graph/nodes?room=${encodeURIComponent(room)}`
      : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: 2500,
    revalidateOnFocus: true,
  });
  return {
    data: data ?? null,
    error,
    isLoading: Boolean(key) && isLoading,
    mutate,
  };
}

export async function postGraphNode(body: {
  room: string;
  user_id: string;
  name: string;
  side: "groom" | "bride";
  tags: string[];
  message?: string;
}): Promise<GraphNodesResponse> {
  const res = await fetch("/api/graph/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Register failed");
  }
  return res.json();
}

export async function postGraphAdmin(body: {
  room: string;
  op: "open" | "reset" | "extend";
}): Promise<GraphNodesResponse & { deleted?: number }> {
  const res = await fetch("/api/graph/admin", {
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
