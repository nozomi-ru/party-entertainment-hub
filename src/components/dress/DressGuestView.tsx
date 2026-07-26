"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DressIcon } from "@/components/DressIcon";
import { DressFrame } from "@/components/dress/DressFrame";
import { useGuestSession } from "@/hooks/use-guest-session";
import { postDressVote, useDressState } from "@/hooks/use-dress-state";
import type { DressColorId } from "@/lib/dress/colors";
import { isDressColorId } from "@/lib/dress/colors";

const VOTE_KEY = "dress_my_color";
const NAME_KEY = "dress_display_name";

export function DressGuestView() {
  const { guestId, ready } = useGuestSession();
  const { snapshot, error, isLoading, mutate } = useDressState();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<DressColorId | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOTE_KEY);
      if (saved && isDressColorId(saved)) setSelected(saved);
      const n = localStorage.getItem(NAME_KEY);
      if (n) setName(n);
    } catch {
      /* ignore */
    }
  }, []);

  if (isLoading && !snapshot) {
    return (
      <DressFrame titleEn="Dress" subtitle="Color Guess">
        <p className="dress-hint">同期中…</p>
      </DressFrame>
    );
  }
  if (error || !snapshot) {
    return (
      <DressFrame titleEn="Dress" subtitle="Color Guess">
        <p className="dress-error">読み込みに失敗しました</p>
      </DressFrame>
    );
  }

  const status = snapshot.status;
  const myColor = selected
    ? snapshot.colors.find((c) => c.id === selected)
    : null;

  if (status === "result") {
    const won =
      selected != null &&
      snapshot.correct_color != null &&
      selected === snapshot.correct_color;
    if (won) {
      return (
        <DressFrame titleEn="Dress" bare>
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center dress-strobe"
            data-testid="dress-win"
          >
            <p
              className="text-5xl font-semibold tracking-wide drop-shadow-lg sm:text-6xl"
              style={{
                fontFamily: '"Playfair Display", serif',
                color: "#1a1a1a",
              }}
            >
              大当たり！
            </p>
          </div>
        </DressFrame>
      );
    }
    return (
      <DressFrame titleEn="Dress" bare>
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          data-testid="dress-lose"
        >
          <p
            className="text-3xl tracking-wide text-white/80"
            style={{ fontFamily: '"Noto Serif JP", serif' }}
          >
            残念…
          </p>
        </div>
      </DressFrame>
    );
  }

  if (status === "closed" && myColor) {
    return (
      <DressFrame titleEn="Dress" bare>
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: myColor.glow }}
          data-testid="dress-penlight"
        >
          <p
            className="max-w-xs text-sm font-medium tracking-wide text-white drop-shadow"
            style={{ fontFamily: '"Noto Serif JP", serif' }}
          >
            画面の明るさを最大にして、スマホをペンライトにしましょう
          </p>
        </div>
      </DressFrame>
    );
  }

  if (status === "idle" || status === "closed") {
    return (
      <DressFrame
        titleEn="Dress"
        subtitle="Color Guess"
        lead="お色直しドレス色当て"
      >
        <p className="dress-hint" data-testid="dress-wait">
          {status === "closed"
            ? "投票は締め切りました。司会の進行をお待ちください。"
            : "まもなく投票が始まります。しばらくお待ちください。"}
        </p>
      </DressFrame>
    );
  }

  const vote = async (color: DressColorId) => {
    if (!ready || !guestId) return;
    setMsg("");
    try {
      localStorage.setItem(NAME_KEY, name.trim() || "ゲスト");
      const snap = await postDressVote({
        user_id: guestId,
        name: name.trim() || "ゲスト",
        color,
      });
      setSelected(color);
      localStorage.setItem(VOTE_KEY, color);
      await mutate(snap, { revalidate: false });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "投票に失敗しました");
    }
  };

  return (
    <DressFrame
      titleEn="Dress"
      subtitle="Color Guess"
      lead="お色直しの後のドレスは何色？"
    >
      <div className="dress-field">
        <label htmlFor="dress-name">表示名</label>
        <input
          id="dress-name"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          data-testid="dress-name"
          placeholder="ゲスト"
        />
      </div>
      {msg && (
        <p className="dress-error" data-testid="dress-error">
          {msg}
        </p>
      )}
      <ul className="dress-color-grid">
        {snapshot.colors.map((c) => {
          const on = selected === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={!ready || !guestId}
                data-testid={`dress-color-${c.id}`}
                onClick={() => void vote(c.id)}
                className={`dress-color-btn${on ? " is-selected" : ""}`}
              >
                <motion.div
                  animate={on ? { y: -2 } : { y: 0 }}
                  style={{ color: "#1a1a1a" }}
                >
                  <DressIcon color={c.fill} className="h-28 w-20" />
                </motion.div>
                <span className="label">{c.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="dress-hint">
        タップで投票。再タップで変更できます（1人1票）
      </p>
    </DressFrame>
  );
}
