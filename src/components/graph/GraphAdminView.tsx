"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CopyUrlRow } from "@/components/CopyUrlRow";
import { RoomTtlBar } from "@/components/RoomTtlBar";
import { DressFrame } from "@/components/dress/DressFrame";
import { postGraphAdmin, useGraphNodes } from "@/hooks/use-graph-nodes";
import {
  allocateUniqueRoomCode,
  parseRoomParam,
} from "@/lib/live/room-code";
import { siteUrl } from "@/config/site";

function originBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return siteUrl;
}

export function GraphAdminView() {
  const router = useRouter();
  const search = useSearchParams();
  const roomFromUrl = parseRoomParam(search.get("room"));
  const [room, setRoom] = useState(roomFromUrl);
  const { data, error, isLoading, mutate } = useGraphNodes(
    room.length === 4 ? room : null,
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setRoom(roomFromUrl);
  }, [roomFromUrl]);

  const urls = useMemo(() => {
    if (room.length !== 4) return null;
    const base = originBase();
    return {
      admin: `${base}/graph/admin?room=${room}`,
      guest: `${base}/graph/guest?room=${room}`,
      screen: `${base}/graph/screen?room=${room}`,
    };
  }, [room]);

  const createRoom = async () => {
    setMsg("");
    setBusy(true);
    try {
      const code = await allocateUniqueRoomCode(async (candidate) => {
        try {
          await postGraphAdmin({ room: candidate, op: "open" });
          return "ok";
        } catch (e) {
          if ((e as { status?: number }).status === 409) return "conflict";
          throw e;
        }
      });
      setRoom(code);
      router.replace(`/graph/admin?room=${code}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ルーム作成に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (room.length !== 4) return;
    if (!window.confirm("このルームのゲスト登録をすべて削除しますか？")) return;
    setMsg("");
    setBusy(true);
    try {
      const res = await postGraphAdmin({ room, op: "reset" });
      await mutate(res, { revalidate: false });
      setMsg(`${res.deleted ?? 0} 件の登録を削除しました`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "リセットに失敗しました");
    } finally {
      setBusy(false);
    }
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
      const res = await postGraphAdmin({ room, op: "extend" });
      await mutate(res, { revalidate: false });
      setMsg("削除期限を1週間延長しました");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "延長に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DressFrame
      titleEn="相関図ジェネレーター"
      subtitle="Admin"
      lead="ルームを作り、Guest / Screen のURLを配ってください。進行ステータスは不要で、常時受付・常時描画です。"
      navHref="/admin"
      navLabel="Admin"
    >
      <section className="dress-room-gen" data-testid="graph-room-section">
        <h3 className="dress-room-heading">▶ ルームを作る</h3>
        <RoomTtlBar
          showNotice
          expiresAt={data?.expiresAt}
          onExtend={extendTtl}
          busy={busy || room.length !== 4}
          className="dress-ttl-wrap"
        />
        <button
          type="button"
          className="dress-btn dress-btn--ghost"
          style={{ width: "100%" }}
          disabled={busy}
          data-testid="graph-create-room"
          onClick={() => void createRoom()}
        >
          ルームコードを生成する
        </button>

        {room.length === 4 && urls && (
          <div className="dress-room-result" data-testid="graph-room-result">
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
        <section className="dress-panel" style={{ marginTop: "1rem" }}>
          <p className="dress-status" data-testid="graph-admin-count">
            登録ゲスト:{" "}
            <strong>
              {isLoading && !data ? "…" : (data?.nodes.length ?? 0)}
            </strong>
            {error ? " · 取得失敗" : ""}
          </p>
          <button
            type="button"
            className="dress-btn dress-btn--ghost"
            style={{ marginTop: "0.9rem", width: "100%" }}
            disabled={busy}
            data-testid="graph-reset"
            onClick={() => void reset()}
          >
            グラフをリセット（全削除）
          </button>
        </section>
      )}

      {msg && (
        <p className="dress-hint" data-testid="graph-admin-msg">
          {msg}
        </p>
      )}
    </DressFrame>
  );
}
