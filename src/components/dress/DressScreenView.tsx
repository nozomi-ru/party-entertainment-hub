"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DressIcon } from "@/components/DressIcon";
import { DressFrame } from "@/components/dress/DressFrame";
import { useDressState } from "@/hooks/use-dress-state";

export function DressScreenView() {
  const { snapshot, error, isLoading } = useDressState();
  const [showWinners, setShowWinners] = useState(false);
  const [drumming, setDrumming] = useState(false);

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
                <svg viewBox="0 0 12 12" width="12" height="12">
                  <path
                    fill="#b4975a"
                    d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z"
                  />
                </svg>
              </div>
              <p className="dress-subtitle">Correct Color</p>
              <DressIcon
                color={correct.fill}
                className="mt-4 h-[42vh] max-h-[380px] w-auto"
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
        lead="ペンライト（スマホ）を上げて新郎新婦を迎えましょう！"
        wide
      >
        <p className="dress-status" data-testid="dress-screen-closed">
          最終得票 <strong>{snapshot.total}</strong> 票
        </p>
        <ul className="dress-color-grid" style={{ marginTop: "1.5rem" }}>
          {snapshot.colors.map((c) => (
            <li key={c.id}>
              <div className="dress-color-btn" style={{ cursor: "default" }}>
                <DressIcon
                  color={c.fill}
                  className="h-24 w-16"
                  style={{ color: "#1a1a1a" }}
                />
                <span className="label">{c.label}</span>
                <span className="count">{snapshot.counts[c.id] ?? 0}</span>
              </div>
            </li>
          ))}
        </ul>
      </DressFrame>
    );
  }

  return (
    <DressFrame
      titleEn="Dress"
      subtitle="Color Guess"
      lead="お色直しの後のドレスは何色？"
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
                className="h-28 w-20"
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
            </div>
          </li>
        ))}
      </ul>
    </DressFrame>
  );
}
