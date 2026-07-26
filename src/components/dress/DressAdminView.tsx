"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DressIcon } from "@/components/DressIcon";
import { DressFrame } from "@/components/dress/DressFrame";
import { postDressAdmin, useDressState } from "@/hooks/use-dress-state";
import { getDressColor, isDressColorId } from "@/lib/dress/colors";

export function DressAdminView() {
  const search = useSearchParams();
  const ansRaw = (search.get("ans") ?? "").trim().toLowerCase();
  const ans = isDressColorId(ansRaw) ? ansRaw : null;
  const ansMeta = ans ? getDressColor(ans) : null;

  const { snapshot, error, isLoading, mutate } = useDressState();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (status: "voting" | "closed" | "result") => {
    setMsg("");
    if (status === "result" && !ans) {
      setMsg("結果発表には URL に ?ans=色ID が必要です（例: ?ans=orange）");
      return;
    }
    setBusy(true);
    try {
      const snap = await postDressAdmin({
        status,
        ...(status === "result" ? { correct_color: ans! } : {}),
      });
      await mutate(snap, { revalidate: false });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DressFrame
      titleEn="Dress"
      subtitle="Admin"
      lead="正解は URL の ?ans= のみに保持し、結果発表時だけサーバーへ送ります。"
      navHref="/admin"
      navLabel="Admin"
    >
      <div className="dress-panel" style={{ textAlign: "left" }}>
        <p style={{ fontWeight: 700, color: "#1a1a1a" }}>設定されている正解</p>
        {ansMeta ? (
          <div
            className="mt-3 flex items-center gap-4"
            data-testid="dress-ans"
            style={{ marginTop: "0.75rem" }}
          >
            <DressIcon
              color={ansMeta.fill}
              className="h-16 w-12"
              style={{ color: "#1a1a1a" }}
            />
            <div>
              <p style={{ color: "#1a1a1a", fontSize: "1.1rem", margin: 0 }}>
                {ansMeta.label}
              </p>
              <p style={{ margin: "0.2em 0 0", fontSize: "0.75rem" }}>
                ans={ansMeta.id}
              </p>
            </div>
          </div>
        ) : (
          <p className="dress-error" data-testid="dress-ans-missing">
            URL に有効な ?ans= がありません。例:{" "}
            <code>/dress/admin?ans=orange</code>
          </p>
        )}
      </div>

      {(isLoading && !snapshot) || error ? (
        <p className="dress-hint">{error ? "状態の取得に失敗" : "同期中…"}</p>
      ) : (
        <p className="dress-status" data-testid="dress-admin-status">
          現在: <strong>{snapshot?.status ?? "idle"}</strong>
          {snapshot ? ` · ${snapshot.total} 票` : ""}
        </p>
      )}

      {msg && (
        <p className="dress-error" data-testid="dress-admin-error">
          {msg}
        </p>
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
          CLOSED
        </button>
        <button
          type="button"
          disabled={busy || !ans}
          className="dress-btn dress-btn--gold"
          data-testid="dress-result"
          onClick={() => void run("result")}
        >
          RESULT
        </button>
      </div>

      <div className="dress-panel" style={{ marginTop: "1.5rem" }}>
        <p>
          Guest:{" "}
          <Link href="/dress/guest" style={{ color: "#b4975a" }}>
            /dress/guest
          </Link>
        </p>
        <p>
          Screen:{" "}
          <Link href="/dress/screen" style={{ color: "#b4975a" }}>
            /dress/screen
          </Link>
        </p>
        <p>
          Admin: /dress/admin?ans={ans ?? "orange"}
        </p>
      </div>
    </DressFrame>
  );
}
