import { describe, expect, it } from "vitest";
import {
  clampWishText,
  normalizeWishEntry,
  normalizeWishRoom,
  normalizeWishTitle,
} from "@/lib/wish";
import { toGuestView, type WishSession } from "@/lib/wish-store";

describe("normalizeWishRoom", () => {
  it("UT-WISH-ROOM-01: 英数字4文字に正規化する", () => {
    expect(normalizeWishRoom("ab-12!")).toBe("AB12");
  });

  it("UT-WISH-ROOM-02: 余分な文字は切り捨てる", () => {
    expect(normalizeWishRoom("ABCDEF")).toBe("ABCD");
  });
});

describe("normalizeWishEntry", () => {
  it("UT-WISH-ENTRY-01: 名前と本文が揃えば ok", () => {
    expect(normalizeWishEntry(" 花子 ", " おめでとう！ ")).toEqual({
      name: "花子",
      text: "おめでとう！",
      ok: true,
    });
  });

  it("UT-WISH-ENTRY-02: 空なら ok ではない", () => {
    expect(normalizeWishEntry("", "hi").ok).toBe(false);
    expect(normalizeWishEntry("名", "").ok).toBe(false);
  });

  it("UT-WISH-ENTRY-03: 長文は切り詰める", () => {
    const long = "あ".repeat(200);
    const entry = normalizeWishEntry("名".repeat(40), long);
    expect(entry.name.length).toBe(20);
    expect(entry.text.length).toBe(120);
  });
});

describe("clampWishText / title", () => {
  it("UT-WISH-TEXT-01: 空白を畳む", () => {
    expect(clampWishText("  a   b  ", 10)).toBe("a b");
  });

  it("UT-WISH-TITLE-01: 空なら既定タイトル", () => {
    expect(normalizeWishTitle("")).toBe("お二人へのメッセージ");
  });
});

describe("toGuestView", () => {
  const base: WishSession = {
    room: "ABCD",
    title: "祝",
    showWall: false,
    messages: [
      { id: "1", name: "太郎", text: "おめでとう", createdAt: 1 },
    ],
    updatedAt: 1,
  };

  it("UT-WISH-VIEW-01: 壁非公開ならゲストに本文を伏せる", () => {
    const view = toGuestView(base);
    expect(view.messages[0].id).toBe("1");
    expect(view.messages[0].name).toBe("");
    expect(view.messages[0].text).toBe("");
  });

  it("UT-WISH-VIEW-02: 壁公開ならそのまま返す", () => {
    const view = toGuestView({ ...base, showWall: true });
    expect(view.messages[0].name).toBe("太郎");
    expect(view.messages[0].text).toBe("おめでとう");
  });
});
