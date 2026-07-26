"use client";

import { useGuestSession } from "@/hooks/use-guest-session";

export function GuestSessionPanel() {
  const { guestId, ready } = useGuestSession();

  return (
    <section
      className="rounded-sm border border-[var(--line)] bg-[var(--surface)] px-5 py-6"
      aria-live="polite"
    >
      <h2 className="text-sm font-medium tracking-wide text-[var(--ink-soft)]">
        匿名セッション
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        端末ごとに自動発行された ID です。ログインは不要です。
      </p>
      <p
        className="mt-4 break-all font-mono text-sm text-[var(--ink)]"
        data-testid="guest-id"
      >
        {ready && guestId ? guestId : "発行中…"}
      </p>
    </section>
  );
}
