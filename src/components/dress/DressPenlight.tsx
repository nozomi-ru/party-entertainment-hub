"use client";

import { useEffect, useState } from "react";

type Props = {
  /** 画面全体の塗り（投票色の fill） */
  fill: string;
  label: string;
  /** CLOSED など主催側から強制された入場演出 */
  forced?: boolean;
  onExit?: () => void;
};

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return false;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  return (r * 299 + g * 587 + b * 114) / 1000 > 168;
}

/**
 * 投票色でスマホ画面を全面点灯し、新婦入場をペンライト迎える。
 */
export function DressPenlight({ fill, label, forced = false, onExit }: Props) {
  const [tipVisible, setTipVisible] = useState(true);
  const light = isLightColor(fill);
  const ink = light ? "rgba(26,26,26,0.72)" : "rgba(255,255,255,0.92)";

  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
          lock = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* 非対応・拒否は無視 */
      }
    };
    void request();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      void lock?.release();
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setTipVisible(false), 4500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="dress-penlight"
      style={{ backgroundColor: fill }}
      data-testid="dress-penlight"
      role="presentation"
      onClick={() => setTipVisible((v) => !v)}
    >
      <div
        className={`dress-penlight-tip${tipVisible ? " is-on" : ""}`}
        style={{ color: ink }}
      >
        <p className="dress-penlight-label">{label}</p>
        <p>
          画面の明るさを最大にして、
          <br />
          スマホを挙げて新婦を迎えましょう
        </p>
        {!forced && onExit && (
          <button
            type="button"
            className="dress-penlight-exit"
            style={{ color: ink, borderColor: ink }}
            data-testid="dress-penlight-exit"
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}
