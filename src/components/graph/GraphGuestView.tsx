"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DressFrame } from "@/components/dress/DressFrame";
import { postGraphNode } from "@/hooks/use-graph-nodes";
import { useGuestSession } from "@/hooks/use-guest-session";
import { parseRoomParam } from "@/lib/live/room-code";
import {
  GRAPH_CUSTOM_TAG_MAX,
  GRAPH_MESSAGE_MAX,
  GRAPH_NAME_MAX,
  GRAPH_PRESET_TAGS,
  type GraphNodeRecord,
  type GraphSide,
} from "@/lib/graph/types";

const DONE_KEY = "graph_registered";

export function GraphGuestView() {
  const router = useRouter();
  const search = useSearchParams();
  const roomFromUrl = parseRoomParam(search.get("room"));
  const [roomInput, setRoomInput] = useState(roomFromUrl);
  const room = roomFromUrl.length === 4 ? roomFromUrl : "";

  const { guestId, ready } = useGuestSession();
  const [name, setName] = useState("");
  const [side, setSide] = useState<GraphSide>("groom");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<GraphNodeRecord | null>(null);

  useEffect(() => {
    setRoomInput(roomFromUrl);
  }, [roomFromUrl]);

  useEffect(() => {
    if (!room) return;
    try {
      const raw = sessionStorage.getItem(`${DONE_KEY}:${room}`);
      if (raw) setDone(JSON.parse(raw) as GraphNodeRecord);
    } catch {
      /* ignore */
    }
  }, [room]);

  if (!room) {
    return (
      <DressFrame
        titleEn="相関図"
        subtitle="Guest"
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
          onClick={() => router.replace(`/graph/guest?room=${roomInput}`)}
        >
          入室する
        </button>
      </DressFrame>
    );
  }

  if (done) {
    return (
      <DressFrame
        titleEn="登録完了！"
        subtitle="Guest Network"
        lead="スクリーンの相関図を見てみよう"
      >
        <div
          className="graph-done"
          data-testid="graph-done"
          style={{
            borderColor: done.side === "bride" ? "#c98b9a" : "#5c6b78",
          }}
        >
          <span
            className="graph-done-dot"
            style={{
              background: done.side === "bride" ? "#c98b9a" : "#5c6b78",
            }}
          />
          <p className="graph-done-name">{done.name}</p>
          <p className="dress-hint" style={{ marginTop: "0.4rem" }}>
            {done.side === "bride" ? "新婦側" : "新郎側"}
            {done.tags.length ? ` · ${done.tags.join(" / ")}` : ""}
          </p>
        </div>
        <button
          type="button"
          className="dress-btn dress-btn--ghost"
          style={{ width: "100%", marginTop: "1.2rem" }}
          data-testid="graph-edit-again"
          onClick={() => {
            setDone(null);
            try {
              sessionStorage.removeItem(`${DONE_KEY}:${room}`);
            } catch {
              /* ignore */
            }
          }}
        >
          内容を修正する
        </button>
      </DressFrame>
    );
  }

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustom = () => {
    const t = customTag.trim().slice(0, GRAPH_CUSTOM_TAG_MAX);
    if (!t) return;
    setTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setCustomTag("");
  };

  const submit = async () => {
    if (!ready || !guestId) return;
    setError("");
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (tags.length === 0) {
      setError("関係性タグを1つ以上選んでください");
      return;
    }
    setBusy(true);
    try {
      const res = await postGraphNode({
        room,
        user_id: guestId,
        name: name.trim(),
        side,
        tags,
        message: message.trim(),
      });
      const node = res.node ?? {
        user_id: guestId,
        name: name.trim(),
        side,
        tags,
        message: message.trim(),
        timestamp: Date.now(),
      };
      setDone(node);
      try {
        sessionStorage.setItem(`${DONE_KEY}:${room}`, JSON.stringify(node));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "登録に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DressFrame
      titleEn="相関図に参加"
      subtitle="Guest Network"
      lead="お名前と関係性を登録すると、スクリーンの相関図にあなたの星が現れます。"
    >
      <label className="dress-field">
        <span>名前（必須）</span>
        <input
          value={name}
          maxLength={GRAPH_NAME_MAX}
          data-testid="graph-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="ニックネーム可"
        />
      </label>

      <p className="graph-field-label">新郎側 / 新婦側</p>
      <div className="graph-side-row" data-testid="graph-side">
        <button
          type="button"
          className={`graph-side-btn${side === "groom" ? " is-on" : ""}`}
          data-testid="graph-side-groom"
          onClick={() => setSide("groom")}
        >
          新郎側
        </button>
        <button
          type="button"
          className={`graph-side-btn graph-side-btn--bride${side === "bride" ? " is-on" : ""}`}
          data-testid="graph-side-bride"
          onClick={() => setSide("bride")}
        >
          新婦側
        </button>
      </div>

      <p className="graph-field-label">関係性タグ（複数可）</p>
      <div className="graph-tag-list" data-testid="graph-tags">
        {GRAPH_PRESET_TAGS.map((tag) => {
          const on = tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              className={`graph-tag${on ? " is-on" : ""}`}
              data-testid={`graph-tag-${tag}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          );
        })}
        {tags
          .filter((t) => !(GRAPH_PRESET_TAGS as readonly string[]).includes(t))
          .map((tag) => (
            <button
              key={tag}
              type="button"
              className="graph-tag is-on"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
      </div>
      <div className="graph-custom-row">
        <input
          value={customTag}
          maxLength={GRAPH_CUSTOM_TAG_MAX}
          data-testid="graph-custom-tag"
          placeholder="カスタムタグ"
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button
          type="button"
          className="dress-btn dress-btn--ghost"
          data-testid="graph-add-tag"
          onClick={addCustom}
        >
          追加
        </button>
      </div>

      <label className="dress-field" style={{ marginTop: "1rem" }}>
        <span>お祝いメッセージ（任意）</span>
        <input
          value={message}
          maxLength={GRAPH_MESSAGE_MAX}
          data-testid="graph-message"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="おめでとう！"
        />
      </label>

      {error && (
        <p className="dress-error" data-testid="graph-error">
          {error}
        </p>
      )}

      <button
        type="button"
        className="dress-btn"
        style={{ width: "100%", marginTop: "1.2rem" }}
        disabled={busy || !ready || !guestId}
        data-testid="graph-submit"
        onClick={() => void submit()}
      >
        相関図に登録する
      </button>
      <p className="dress-hint" data-testid="room-code">
        ルーム {room}
      </p>
    </DressFrame>
  );
}
