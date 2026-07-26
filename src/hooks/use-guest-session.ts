"use client";

import { useEffect, useState } from "react";
import { getOrCreateGuestId } from "@/lib/guest-session";

/**
 * ゲスト UUID をマウント時に確保する。SSR では null。
 */
export function useGuestSession(): {
  guestId: string | null;
  ready: boolean;
} {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGuestId(getOrCreateGuestId());
    setReady(true);
  }, []);

  return { guestId, ready };
}
