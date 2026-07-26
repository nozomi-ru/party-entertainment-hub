"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DressIcon } from "@/components/DressIcon";
import { CopyUrlRow } from "@/components/CopyUrlRow";
import { RoomTtlBar } from "@/components/RoomTtlBar";
import { DressFrame } from "@/components/dress/DressFrame";
import { postDressAdmin, useDressState } from "@/hooks/use-dress-state";
import {
  DRESS_COLOR_MAX,
  DRESS_COLOR_MIN,
  DEFAULT_DRESS_COLORS,
  deriveGlow,
  findDressColor,
  newColorId,
  type DressColorOption,
} from "@/lib/dress/colors";
import {
  allocateUniqueRoomCode,
  parseRoomParam,
} from "@/lib/live/room-code";
import { siteUrl } from "@/config/site";

const ANS_STORAGE_KEY = "dress_admin_correct_id";

type DraftColor = {
  key: string;
  id: string;
  label: string;
  fill: string;
};

function toDraft(colors: DressColorOption[]): DraftColor[] {
  return colors.map((c, i) => ({
    key: `${c.id}-${i}`,
    id: c.id,
    label: c.label,
    fill: c.fill,
  }));
}

function originBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return siteUrl;
}

export function DressAdminView() {
  const router = useRouter();
  const search = useSearchParams();
  const roomFromUrl = parseRoomParam(search.get("room"));
  const ansFromUrl = (search.get("ans") ?? "").trim().toLowerCase();

  const [room, setRoom] = useState(roomFromUrl);
  const { snapshot, error, isLoading, mutate } = useDressState(
    room.length === 4 ? room : null,
  );
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<DraftColor[]>(() =>
    toDraft(DEFAULT_DRESS_COLORS),
  );
  const [correctId, setCorrectId] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    setRoom(roomFromUrl);
    setSynced(false);
  }, [roomFromUrl]);

  useEffect(() => {
    if (!snapshot || synced) return;
    setDraft(toDraft(snapshot.colors));
    try {
      const saved = sessionStorage.getItem(`${ANS_STORAGE_KEY}:${room}`) ?? "";
      const pick =
        (ansFromUrl && findDressColor(snapshot.colors, ansFromUrl)?.id) ||
        (saved && findDressColor(snapshot.colors, saved)?.id) ||
        snapshot.colors[0]?.id ||
        "";
      setCorrectId(pick);
    } catch {
      setCorrectId(snapshot.colors[0]?.id ?? "");
    }
    setSynced(true);
  }, [snapshot, synced, ansFromUrl, room]);

  useEffect(() => {
    if (!correctId || room.length !== 4) return;
    try {
      sessionStorage.setItem(`${ANS_STORAGE_KEY}:${room}`, correctId);
    } catch {
      /* ignore */
    }
  }, [correctId, room]);

  const urls = useMemo(() => {
    if (room.length !== 4) return null;
    const base = originBase();
    return {
      admin: `${base}/dress/admin?room=${room}`,
      guest: `${base}/dress/guest?room=${room}`,
      screen: `${base}/dress/screen?room=${room}`,
    };
  }, [room]);

  const ansMeta = findDressColor(
    draft.map((d) => ({
      id: d.id,
      label: d.label,
      fill: d.fill,
      glow: deriveGlow(d.fill),
    })),
    correctId,
  );

  const createRoom = async () => {
    setMsg("");
    setBusy(true);
    try {
      const code = await allocateUniqueRoomCode(async (candidate) => {
        try {
          await postDressAdmin({ room: candidate, op: "open" });
          return "ok";
        } catch (e) {
          if ((e as { status?: number }).status === 409) return "conflict";
          throw e;
        }
      });
      setRoom(code);
      setSynced(false);
      router.replace(`/dress/admin?room=${code}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ルーム作成に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const saveColors = async () => {
    if (room.length !== 4) {
      setMsg("先にルームを作成してください");
      return;
    }
    setMsg("");
    setBusy(true);
    try {
      const colors = draft.map((d) => ({
        id: d.id,
        label: d.label,
        fill: d.fill,
        glow: deriveGlow(d.fill),
      }));
      const snap = await postDressAdmin({
        room,
        op: "setColors",
        colors,
      });
      await mutate(snap, { revalidate: false });
      setDraft(toDraft(snap.colors));
      if (!findDressColor(snap.colors, correctId)) {
        setCorrectId(snap.colors[0]?.id ?? "");
      }
      setMsg("色の設定を保存しました");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "色の保存に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const run = async (status: "voting" | "closed" | "result") => {
    if (room.length !== 4) {
      setMsg("先にルームを作成してください");
      return;
    }
    setMsg("");
    if (status === "result" && !correctId) {
      setMsg("結果発表の前に、正解の色を選んでください");
      return;
    }
    setBusy(true);
    try {
      const snap = await postDressAdmin({
        room,
        status,
        ...(status === "result" ? { correct_color: correctId } : {}),
      });
      await mutate(snap, { revalidate: false });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const addColor = () => {
    if (draft.length >= DRESS_COLOR_MAX) return;
    const used = new Set(draft.map((d) => d.id));
    const id = newColorId(used);
    setDraft((prev) => [
      ...prev,
      { key: `${id}-${Date.now()}`, id, label: "新しい色", fill: "#C4A574" },
    ]);
  };

  const removeColor = (key: string) => {
    if (draft.length <= DRESS_COLOR_MIN) return;
    setDraft((prev) => {
      const next = prev.filter((d) => d.key !== key);
      if (!next.some((d) => d.id === correctId)) {
        setCorrectId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("コピーしました");
    } catch {
      setMsg("コピーに失敗しました。入力欄を選択して手動コピーしてください");
    }
  };

  const extendTtl = async () => {
    if (room.length !== 4) return;
    setMsg("");
    setBusy(true);
    try {
      const snap = await postDressAdmin({ room, op: "extend" });
      await mutate(snap, { revalidate: false });
      setMsg("削除期限を1週間延長しました");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "延長に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DressFrame
      titleEn="Dress"
      subtitle="Admin"
      lead="ルームを作り、Guest / Screen のフルURLを配ってください。正解はこの端末にだけ保持します。"
      navHref="/admin"
      navLabel="Admin"
    >
      <section className="dress-room-gen" data-testid="dress-room-section">
        <h3 className="dress-room-heading">▶ ルームを作る</h3>
        <p className="dress-hint" style={{ marginTop: 0, textAlign: "left" }}>
          ルームを作ると、ゲスト投票とスクリーン表示を同じ会場セッションで同期できます。
        </p>
        <RoomTtlBar
          showNotice
          expiresAt={snapshot?.expiresAt}
          onExtend={extendTtl}
          busy={busy || room.length !== 4}
          className="dress-ttl-wrap"
        />
        <button
          type="button"
          className="dress-btn dress-btn--ghost"
          style={{ width: "100%" }}
          disabled={busy}
          data-testid="dress-create-room"
          onClick={() => void createRoom()}
        >
          ルームコードを生成する
        </button>

        {room.length === 4 && urls && (
          <div className="dress-room-result" data-testid="dress-room-result">
            <p className="dress-room-code" data-testid="room-code">
              {room}
            </p>
            <CopyUrlRow
              label="Admin URL（幹事用）"
              url={urls.admin}
              testId="url-admin-box"
              textTestId="url-admin-text"
            />
            <CopyUrlRow
              label="Guest URL（ゲスト配布用）"
              url={urls.guest}
              testId="url-guest-box"
              textTestId="url-guest-text"
            />
            <CopyUrlRow
              label="Screen URL（会場スクリーン用）"
              url={urls.screen}
              testId="url-screen-box"
              textTestId="url-screen-text"
            />
            <button
              type="button"
              className="dress-btn dress-btn--ghost"
              style={{ width: "100%", marginTop: "0.55rem" }}
              data-testid="copy-guest-screen"
              onClick={() =>
                void copyText(
                  `Guest: ${urls.guest}\nScreen: ${urls.screen}`,
                )
              }
            >
              Guest + Screen をまとめてコピー
            </button>
            <p className="dress-hint" style={{ textAlign: "left", marginTop: "0.5rem" }}>
              「コピー」を押すか、URL欄をタップして選択→貼り付けできます。
            </p>
          </div>
        )}
      </section>

      {room.length === 4 && (
        <>
          <section className="dress-panel" style={{ textAlign: "left" }}>
            <p
              style={{
                fontWeight: 700,
                color: "#1a1a1a",
                marginBottom: "0.75rem",
              }}
            >
              投票の色（{DRESS_COLOR_MIN}〜{DRESS_COLOR_MAX}色）
            </p>
            <ul className="dress-admin-color-list" data-testid="dress-color-editor">
              {draft.map((row, index) => (
                <li key={row.key} className="dress-admin-color-row">
                  <input
                    type="color"
                    value={row.fill}
                    aria-label={`${row.label}の色`}
                    data-testid={`dress-fill-${index}`}
                    onChange={(e) => {
                      const fill = e.target.value.toUpperCase();
                      setDraft((prev) =>
                        prev.map((d) =>
                          d.key === row.key ? { ...d, fill } : d,
                        ),
                      );
                    }}
                  />
                  <input
                    type="text"
                    className="dress-admin-label"
                    value={row.label}
                    maxLength={20}
                    data-testid={`dress-label-${index}`}
                    onChange={(e) => {
                      const label = e.target.value;
                      setDraft((prev) =>
                        prev.map((d) =>
                          d.key === row.key ? { ...d, label } : d,
                        ),
                      );
                    }}
                  />
                  <DressIcon
                    color={row.fill}
                    className="h-12 w-auto"
                    style={{ color: "#1a1a1a", flexShrink: 0 }}
                  />
                  <button
                    type="button"
                    className="dress-btn dress-btn--ghost"
                    style={{ padding: "0.4em 0.7em", minHeight: 36 }}
                    disabled={draft.length <= DRESS_COLOR_MIN || busy}
                    data-testid={`dress-remove-${index}`}
                    onClick={() => removeColor(row.key)}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
            <div className="dress-btn-row" style={{ marginTop: "0.9rem" }}>
              <button
                type="button"
                className="dress-btn dress-btn--ghost"
                disabled={draft.length >= DRESS_COLOR_MAX || busy}
                data-testid="dress-add-color"
                onClick={addColor}
              >
                色を追加
              </button>
              <button
                type="button"
                className="dress-btn"
                disabled={busy}
                data-testid="dress-save-colors"
                onClick={() => void saveColors()}
              >
                色を保存
              </button>
            </div>
          </section>

          <section
            className="dress-panel"
            style={{ textAlign: "left", marginTop: "1rem" }}
          >
            <p style={{ fontWeight: 700, color: "#1a1a1a" }}>
              正解（この端末のみ）
            </p>
            <label
              className="dress-field"
              style={{ marginTop: "0.6rem", marginBottom: 0 }}
            >
              <span className="sr-only">正解の色</span>
              <select
                className="dress-admin-select"
                value={correctId}
                data-testid="dress-correct-select"
                onChange={(e) => setCorrectId(e.target.value)}
              >
                {draft.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label || d.id}
                  </option>
                ))}
              </select>
            </label>
            {ansMeta && (
              <div
                className="flex items-center gap-3"
                data-testid="dress-ans"
                style={{ marginTop: "0.75rem" }}
              >
                <DressIcon
                  color={ansMeta.fill}
                  className="h-16 w-auto"
                  style={{ color: "#1a1a1a" }}
                />
                <p style={{ color: "#1a1a1a", margin: 0 }}>{ansMeta.label}</p>
              </div>
            )}
          </section>

          {(isLoading && !snapshot) || error ? (
            <p className="dress-hint">
              {error ? "状態の取得に失敗" : "同期中…"}
            </p>
          ) : (
            <p className="dress-status" data-testid="dress-admin-status">
              現在: <strong>{snapshot?.status ?? "idle"}</strong>
              {snapshot ? ` · ${snapshot.total} 票` : ""}
            </p>
          )}

          {snapshot && snapshot.voters.length > 0 && (
            <section
              className="dress-panel"
              style={{ marginTop: "1rem" }}
              data-testid="dress-voter-list"
            >
              <p style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: "0.6rem" }}>
                投票者一覧
              </p>
              <ul className="dress-voter-list">
                {snapshot.voters.map((v) => {
                  const label =
                    snapshot.colors.find((c) => c.id === v.color)?.label ??
                    v.color;
                  return (
                    <li key={v.user_id}>
                      <span className="dress-voter-name">{v.name}</span>
                      <span className="dress-voter-color">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="dress-btn-row" data-testid="admin-controls">
            <button
              type="button"
              disabled={busy}
              className="dress-btn"
              data-testid="dress-voting"
              onClick={() => void run("voting")}
            >
              VOTING
            </button>
            <button
              type="button"
              disabled={busy}
              className="dress-btn dress-btn--ghost"
              data-testid="dress-closed"
              onClick={() => void run("closed")}
            >
              CLOSED（ペンライト迎）
            </button>
            <button
              type="button"
              disabled={busy || !correctId}
              className="dress-btn dress-btn--gold"
              data-testid="dress-result"
              onClick={() => void run("result")}
            >
              RESULT
            </button>
          </div>
        </>
      )}

      {msg && (
        <p className="dress-error" data-testid="dress-admin-error">
          {msg}
        </p>
      )}
    </DressFrame>
  );
}
