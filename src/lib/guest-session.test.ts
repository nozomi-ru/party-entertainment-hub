import { describe, expect, it } from "vitest";
import {
  createGuestId,
  isValidGuestId,
  readGuestIdFromCookieHeader,
} from "@/lib/guest-session";

describe("guest-session", () => {
  it("UT-GUEST-01: createGuestId は UUID 形式", () => {
    const id = createGuestId();
    expect(isValidGuestId(id)).toBe(true);
  });

  it("UT-GUEST-02: 不正な文字列は拒否する", () => {
    expect(isValidGuestId("")).toBe(false);
    expect(isValidGuestId("not-a-uuid")).toBe(false);
    expect(isValidGuestId("zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz")).toBe(false);
  });

  it("UT-GUEST-03: Cookie ヘッダから ID を読める", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const header = `foo=1; kotohogi_guest_id=${id}; bar=2`;
    expect(readGuestIdFromCookieHeader(header)).toBe(id);
  });

  it("UT-GUEST-04: Cookie が無い／不正なら null", () => {
    expect(readGuestIdFromCookieHeader(null)).toBeNull();
    expect(readGuestIdFromCookieHeader("kotohogi_guest_id=bad")).toBeNull();
  });
});
