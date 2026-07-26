import { describe, expect, it } from "vitest";
import {
  bumpExpiresAt,
  createRoomTtl,
  ensureRoomTtl,
  formatExpiresAtJa,
  KV_EVENT_TTL_SECONDS,
  resolveExpiresAt,
  ttlSecondsUntil,
} from "@/lib/room-ttl";

describe("room-ttl", () => {
  it("UT-TTL-01: createRoomTtl sets expiresAt = now + 7 days", () => {
    const now = 1_700_000_000_000;
    const ttl = createRoomTtl(now);
    expect(ttl.createdAt).toBe(now);
    expect(ttl.expiresAt).toBe(now + KV_EVENT_TTL_SECONDS * 1000);
  });

  it("UT-TTL-02: ttlSecondsUntil clamps to at least 60", () => {
    const now = 1_000_000;
    expect(ttlSecondsUntil(now - 1000, now)).toBe(60);
    expect(ttlSecondsUntil(now + 120_000, now)).toBe(120);
  });

  it("UT-TTL-03: resolveExpiresAt prefers explicit expiresAt", () => {
    expect(
      resolveExpiresAt({ expiresAt: 100, createdAt: 1, updatedAt: 2 }),
    ).toBe(100);
  });

  it("UT-TTL-03b: resolveExpiresAt falls back to createdAt + TTL", () => {
    const createdAt = 1_000_000;
    expect(resolveExpiresAt({ createdAt })).toBe(
      createdAt + KV_EVENT_TTL_SECONDS * 1000,
    );
  });

  it("UT-TTL-04: ensureRoomTtl fills missing fields", () => {
    const now = 2_000_000;
    const out = ensureRoomTtl({ room: "ABCD", updatedAt: now }, now);
    expect(out.createdAt).toBe(now);
    expect(out.expiresAt).toBe(now + KV_EVENT_TTL_SECONDS * 1000);
    expect(out.room).toBe("ABCD");
  });

  it("UT-TTL-05: bumpExpiresAt and formatExpiresAtJa", () => {
    const now = 5_000_000;
    expect(bumpExpiresAt(now)).toBe(now + KV_EVENT_TTL_SECONDS * 1000);
    const s = formatExpiresAtJa(Date.UTC(2026, 6, 26, 12, 0, 0));
    expect(s).toMatch(/2026/);
  });
});
