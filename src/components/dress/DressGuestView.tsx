"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DressIcon } from "@/components/DressIcon";
import { DressFrame } from "@/components/dress/DressFrame";
import { DressPenlight } from "@/components/dress/DressPenlight";
import { useGuestSession } from "@/hooks/use-guest-session";
import { postDressVote, useDressState } from "@/hooks/use-dress-state";
import { parseRoomParam } from "@/lib/live/room-code";

const VOTE_KEY = "dress_my_color";
const NAME_KEY = "dress_display_name";

export function DressGuestView() {
  const router = useRouter();
  const search = useSearchParams();
  const roomFromUrl = parseRoomParam(search.get("room"));
  const [roomInput, setRoomInput] = useState(roomFromUrl);
  const room = roomFromUrl.length === 4 ? roomFromUrl : "";

  const { guestId, ready } = useGuestSession();
  const { snapshot, error, isLoading, mutate } = useDressState(room || null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  /** ゲストが手動でペンライトを点灯 */
  const [lightOn, setLightOn] = useState(false);

  useEffect(() => {
    setRoomInput(roomFromUrl);
  }, [roomFromUrl]);

  useEffect(() => {
    if (!room) return;
    try {
      const saved = localStorage.getItem(`${VOTE_KEY}:${room}`);
      if (saved) setSelected(saved);
      const n = localStorage.getItem(NAME_KEY);
      if (n) setName(n);
    } catch {
      /* ignore */
    }
  }, [room]);

  /** 司会が CLOSED にしたら入場演出として自動点灯 */
  useEffect(() => {
    if (snapshot?.status === "closed" && selected) {
      setLightOn(true);
    }
    if (snapshot?.status === "result" || snapshot?.status === "voting") {
      if (snapshot.status === "result") setLightOn(false);
    }
  }, [snapshot?.status, selected]);

  if (!room) {
    return (
      <DressFrame
        titleEn="Dress"
        subtitle="Color Guess"
        lead="幹事から受け取ったルームコードを入力してください"
      >
        <label className="dress-field">
          <span>ルームコード（4文字）</span>
          <input
            value={roomInput}
            maxLength={4}
            data-testid="room-input"
            onChange={(e) => setRoomInput(parseRoomParam(e.target.value))}
            placeholder="ABCD"
            autoCapitalize="characters"
          />
        </label>
        <button
          type="button"
          className="dress-btn"
          style={{ width: "100%", marginTop: "0.75rem" }}
          disabled={roomInput.length !== 4}
          data-testid="enter-room"
          onClick={() => router.replace(`/dress/guest?room=${roomInput}`)}
        >
          入室する
        </button>
      </DressFrame>
    );
  }

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

  const forcedLight = status === "closed" && Boolean(myColor);
  if (myColor && (lightOn || forcedLight)) {
    return (
      <DressFrame titleEn="Dress" bare>
        <DressPenlight
          fill={myColor.fill}
          label={myColor.label}
          forced={forcedLight}
          onExit={forcedLight ? undefined : () => setLightOn(false)}
        />
      </DressFrame>
    );
  }

  if (status === "closed" && !myColor) {
    return (
      <DressFrame
        titleEn="Dress"
        subtitle="Color Guess"
        lead="お色直しドレス色当て"
      >
        <p className="dress-hint" data-testid="dress-wait">
          投票がありません。司会の進行をお待ちください。
        </p>
      </DressFrame>
    );
  }

  if (status === "idle") {
    return (
      <DressFrame
        titleEn="Dress"
        subtitle="Color Guess"
        lead="お色直しドレス色当て"
      >
        <p className="dress-hint" data-testid="dress-wait">
          まもなく投票が始まります。しばらくお待ちください。
        </p>
      </DressFrame>
    );
  }

  const vote = async (color: string) => {
    if (!ready || !guestId) return;
    setMsg("");
    const displayName = name.trim();
    if (!displayName) {
      setMsg("投票する前に表示名を入力してください");
      return;
    }
    try {
      localStorage.setItem(NAME_KEY, displayName);
      const snap = await postDressVote({
        room,
        user_id: guestId,
        name: displayName,
        color,
      });
      setSelected(color);
      localStorage.setItem(`${VOTE_KEY}:${room}`, color);
      await mutate(snap, { revalidate: false });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "投票に失敗しました");
    }
  };

  return (
    <DressFrame
      titleEn="お色直しの後のドレスは何色？"
      subtitle="What Color Do You Think?"
      lead="表示名を入れてから、正解だと思う色をタップしてください（1人1票・変更可）"
    >
      <div className="dress-field">
        <label htmlFor="dress-name">表示名（必須）</label>
        <input
          id="dress-name"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          data-testid="dress-name"
          placeholder="お名前"
          required
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
                  animate={on ? { y: -3 } : { y: 0 }}
                  style={{ color: "#1a1a1a" }}
                >
                  <DressIcon color={c.fill} className="h-44 w-auto sm:h-48" />
                </motion.div>
                <span className="label">{c.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {myColor && (
        <div className="dress-penlight-cta" data-testid="dress-penlight-cta">
          <button
            type="button"
            className="dress-btn dress-btn--gold"
            style={{ width: "100%" }}
            data-testid="dress-light-on"
            onClick={() => setLightOn(true)}
          >
            画面を「{myColor.label}」にする
          </button>
          <p className="dress-hint" style={{ marginTop: "0.6rem" }}>
            新婦入場のとき、この色のスマホ画面でお出迎えできます。明るさは最大にしてください。
          </p>
        </div>
      )}

      <p className="dress-hint" data-testid="room-code">
        ルーム {room}
      </p>
    </DressFrame>
  );
}
