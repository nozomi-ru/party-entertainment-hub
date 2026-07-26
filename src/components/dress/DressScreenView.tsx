"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DressIcon } from "@/components/DressIcon";
import { DressFrame } from "@/components/dress/DressFrame";
import { useDressState } from "@/hooks/use-dress-state";
import { parseRoomParam } from "@/lib/live/room-code";

export function DressScreenView() {
  const router = useRouter();
  const search = useSearchParams();
  const roomFromUrl = parseRoomParam(search.get("room"));
  const [roomInput, setRoomInput] = useState(roomFromUrl);
  const room = roomFromUrl.length === 4 ? roomFromUrl : "";

  const { snapshot, error, isLoading } = useDressState(room || null);
  const [showWinners, setShowWinners] = useState(false);
  const [drumming, setDrumming] = useState(false);

  useEffect(() => {
    setRoomInput(roomFromUrl);
  }, [roomFromUrl]);

  useEffect(() => {
    if (snapshot?.status !== "result") {
      setShowWinners(false);
      setDrumming(false);
      return;
    }
    setDrumming(true);
    const t1 = window.setTimeout(() => setDrumming(false), 2200);
    const t2 = window.setTimeout(() => setShowWinners(true), 2800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [snapshot?.status, snapshot?.correct_color]);

  if (!room) {
    return (
      <DressFrame
        titleEn="Dress"
        subtitle="Screen"
        lead="幹事から受け取ったルームコードを入力してください"
        wide
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
          onClick={() => router.replace(`/dress/screen?room=${roomInput}`)}
        >
          入室する
        </button>
      </DressFrame>
    );
  }

  if (isLoading && !snapshot) {
    return (
      <DressFrame titleEn="Dress" subtitle="Screen" wide>
        <p className="dress-hint">同期中…</p>
      </DressFrame>
    );
  }
  if (error || !snapshot) {
    return (
      <DressFrame titleEn="Dress" subtitle="Screen" wide>
        <p className="dress-error">読み込み失敗</p>
      </DressFrame>
    );
  }

  const correct = snapshot.colors.find((c) => c.id === snapshot.correct_color);

  if (snapshot.status === "result" && correct) {
    return (
      <div className="dress-app" data-testid="dress-screen-result">
        <div className="dress-card dress-card--wide relative overflow-hidden">
          <AnimatePresence>
            {drumming && (
              <motion.p
                key="drum"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 1, 0.35] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, repeat: 3 }}
                className="absolute inset-0 z-10 flex items-center justify-center"
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "1.6rem",
                  letterSpacing: "0.28em",
                  color: "#b4975a",
                  textTransform: "uppercase",
                  background: "#fff",
                }}
              >
                Drum roll…
              </motion.p>
            )}
          </AnimatePresence>

          {!drumming && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="flex flex-col items-center"
            >
              <div className="dress-ornament" aria-hidden>
                <svg viewBox="0 0 28 22" width="22" height="17">
                  <path
                    d="M4 10 L8 4 L14 8 L20 4 L24 10 L22 18 H6 Z"
                    fill="none"
                    stroke="#b4975a"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <text
                    x="14"
                    y="15.5"
                    textAnchor="middle"
                    fill="#b4975a"
                    fontFamily="Playfair Display, serif"
                    fontSize="8"
                    fontWeight="600"
                  >
                    Q
                  </text>
                </svg>
              </div>
              <p className="dress-subtitle">Correct Color</p>
              <DressIcon
                color={correct.fill}
                className="mt-4 h-[46vh] max-h-[420px] w-auto"
                style={{ color: "#1a1a1a" }}
              />
              <p
                className="dress-title"
                style={{ marginTop: "1rem", fontSize: "2.4rem" }}
                data-testid="dress-correct-label"
              >
                {correct.label}
              </p>
            </motion.div>
          )}

          {showWinners && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-full justify-center overflow-hidden">
              <ul
                className="relative w-full max-w-md"
                data-testid="dress-winners"
              >
                {snapshot.winners.map((w, i) => (
                  <motion.li
                    key={w.user_id}
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 72 + i * 34, opacity: 1 }}
                    transition={{
                      delay: i * 0.12,
                      duration: 0.9,
                      ease: "easeOut",
                    }}
                    className="absolute left-1/2 w-full -translate-x-1/2 text-center"
                    style={{
                      fontFamily: '"Noto Serif JP", serif',
                      fontSize: "1.15rem",
                      color: "#b4975a",
                    }}
                  >
                    {w.name}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (snapshot.status === "closed") {
    return (
      <DressFrame
        titleEn="Dress"
        subtitle="Raise your lights"
        lead="スマホ画面を投票色にして、新婦を迎えましょう！"
        wide
      >
        <p className="dress-status" data-testid="dress-screen-closed">
          最終得票 <strong>{snapshot.total}</strong> 票 · ゲストはペンライト点灯中
        </p>
        <ul className="dress-color-grid" style={{ marginTop: "1.5rem" }}>
          {snapshot.colors.map((c) => (
            <li key={c.id}>
              <div className="dress-color-btn" style={{ cursor: "default" }}>
                <DressIcon
                  color={c.fill}
                  className="h-36 w-auto"
                  style={{ color: "#1a1a1a" }}
                />
                <span className="label">{c.label}</span>
                <span className="count">{snapshot.counts[c.id] ?? 0}</span>
                {(snapshot.voters_by_color[c.id] ?? []).length > 0 && (
                  <p
                    className="dress-voter-names"
                    data-testid={`dress-voters-${c.id}`}
                  >
                    {(snapshot.voters_by_color[c.id] ?? []).join("、")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </DressFrame>
    );
  }

  return (
    <DressFrame
      titleEn="お色直しの後のドレスは何色？"
      subtitle="What Color Do You Think?"
      wide
    >
      <p className="dress-status" data-testid="dress-screen-total">
        {snapshot.status === "voting" ? (
          <>
            投票受付中 · <strong>{snapshot.total}</strong> 票
          </>
        ) : (
          "投票開始待ち"
        )}
      </p>
      <ul className="dress-color-grid" style={{ marginTop: "1.5rem" }}>
        {snapshot.colors.map((c) => (
          <li key={c.id}>
            <div className="dress-color-btn" style={{ cursor: "default" }}>
              <DressIcon
                color={c.fill}
                className="h-44 w-auto"
                style={{ color: "#1a1a1a" }}
              />
              <span className="label">{c.label}</span>
              <motion.span
                key={`${c.id}-${snapshot.counts[c.id]}`}
                initial={{ scale: 1.15, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="count"
                data-testid={`dress-count-${c.id}`}
              >
                {snapshot.counts[c.id] ?? 0}
              </motion.span>
              {(snapshot.voters_by_color[c.id] ?? []).length > 0 && (
                <p
                  className="dress-voter-names"
                  data-testid={`dress-voters-${c.id}`}
                >
                  {(snapshot.voters_by_color[c.id] ?? []).join("、")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DressFrame>
  );
}
