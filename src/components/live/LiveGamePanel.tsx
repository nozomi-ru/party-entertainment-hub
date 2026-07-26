"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState } from "react";
import type { LiveRole } from "@/components/live/LiveShell";
import { useGuestSession } from "@/hooks/use-guest-session";
import { useLiveRoom } from "@/hooks/use-live-room";
import type { LiveGameId } from "@/lib/live/catalog";
import type { LiveSnapshot } from "@/lib/live/types";

const ForceGraph = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type Props = {
  game: LiveGameId;
  role: LiveRole;
  room: string;
  displayName: string;
};

export function LiveGamePanel({
  game,
  role,
  room,
  displayName,
}: Props) {
  const { guestId, ready } = useGuestSession();
  const { snapshot, error, isLoading, admin, guest } = useLiveRoom(game, room);
  const [msg, setMsg] = useState("");

  if (isLoading && !snapshot) {
    return <p className="text-[var(--muted)]">同期中…</p>;
  }
  if (error || !snapshot) {
    return <p className="text-red-700">読み込みに失敗しました</p>;
  }

  const common = { snapshot, role, guestId, ready, displayName, admin, guest, setMsg };

  return (
    <div>
      {msg && (
        <p className="mb-3 text-sm text-red-700" data-testid="live-error">
          {msg}
        </p>
      )}
      {game === "grade" && <GradePanel {...common} />}
      {game === "graph" && <GraphPanel {...common} />}
    </div>
  );
}

type PanelProps = {
  snapshot: LiveSnapshot;
  role: LiveRole;
  guestId: string | null;
  ready: boolean;
  displayName: string;
  admin: (op: string, extra?: Record<string, unknown>) => Promise<LiveSnapshot | undefined>;
  guest: (
    kind: string,
    payload: Record<string, unknown>,
    guestId: string,
    name?: string,
  ) => Promise<LiveSnapshot | undefined>;
  setMsg: (m: string) => void;
};

function AdminBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" data-testid="admin-controls">
      {children}
    </div>
  );
}

function Btn({
  onClick,
  children,
  testId,
}: {
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      className="bg-[var(--ink)] px-4 py-3 text-sm text-white"
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

function GradePanel(p: PanelProps) {
  const state = p.snapshot.state;
  if (state.game !== "grade") return null;
  const summary = p.snapshot.summary as {
    ranking: { name: string; correct: number; total: number; rankLabel: string }[];
  };
  const q = state.questions[state.index];

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="grade-start" onClick={() => void p.admin("start")}>
            開始
          </Btn>
          <Btn testId="grade-next" onClick={() => void p.admin("next")}>
            次へ
          </Btn>
          <Btn testId="grade-results" onClick={() => void p.admin("results")}>
            結果
          </Btn>
        </AdminBar>
        <p>
          {state.phase} / Q{state.index + 1}
        </p>
      </div>
    );
  }

  if (p.role === "screen" || state.phase === "results") {
    return (
      <div>
        <h2 className="text-center font-[family-name:var(--font-display)] text-4xl">
          ゲスト格付け
        </h2>
        <ul className="mx-auto mt-8 max-w-md space-y-2" data-testid="grade-rank">
          {summary.ranking.map((r) => (
            <li key={r.name}>
              [{r.rankLabel}] {r.name} {r.correct}/{r.total}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!q) return <p>待機中</p>;
  return (
    <div>
      <p className="text-xl" data-testid="grade-question">
        {q.q}
      </p>
      <div className="mt-4 grid gap-2">
        {q.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            disabled={!p.ready || !p.guestId}
            className="border border-[var(--line)] bg-white px-4 py-4 text-left disabled:opacity-40"
            data-testid={`grade-choice-${i}`}
            onClick={() => {
              if (!p.guestId) return;
              void p
                .guest(
                  "answer",
                  { questionIndex: state.index, choiceIndex: i },
                  p.guestId,
                  p.displayName,
                )
                .catch((e: Error) => p.setMsg(e.message));
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function GraphPanel(p: PanelProps) {
  const [relName, setRelName] = useState(p.displayName);
  const [target, setTarget] = useState<"bride" | "groom">("bride");
  const [relation, setRelation] = useState("友人");
  const state = p.snapshot.state;
  if (state.game !== "graph") return null;
  const summary = p.snapshot.summary as {
    nodes: { id: string; name: string; group: string }[];
    links: { source: string; target: string; label: string }[];
  };

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="graph-collect" onClick={() => void p.admin("collect")}>
            入力受付
          </Btn>
          <Btn testId="graph-show" onClick={() => void p.admin("show")}>
            グラフ表示
          </Btn>
        </AdminBar>
        <p>ノード数: {summary.nodes.length}</p>
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div className="h-[70vh] w-full" data-testid="graph-canvas">
        <ForceGraph
          graphData={{
            nodes: summary.nodes.map((n) => ({ ...n })),
            links: summary.links.map((l) => ({ ...l })),
          }}
          nodeLabel="name"
          nodeAutoColorBy="group"
          linkDirectionalArrowLength={4}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        className="w-full border border-[var(--line)] px-3 py-3"
        value={relName}
        onChange={(e) => setRelName(e.target.value)}
        placeholder="あなたの名前"
        data-testid="graph-name"
      />
      <select
        className="w-full border border-[var(--line)] px-3 py-3"
        value={target}
        onChange={(e) => setTarget(e.target.value as "bride" | "groom")}
        data-testid="graph-target"
      >
        <option value="bride">{state.bride}</option>
        <option value="groom">{state.groom}</option>
      </select>
      <input
        className="w-full border border-[var(--line)] px-3 py-3"
        value={relation}
        onChange={(e) => setRelation(e.target.value)}
        placeholder="関係（友人・同僚など）"
        data-testid="graph-relation"
      />
      <button
        type="button"
        className="w-full bg-[var(--ink)] py-3 text-white disabled:opacity-40"
        disabled={!p.ready || !p.guestId || state.phase !== "collect"}
        data-testid="graph-submit"
        onClick={() => {
          if (!p.guestId) return;
          void p
            .guest(
              "link",
              { name: relName, target, relation },
              p.guestId,
              relName,
            )
            .catch((e: Error) => p.setMsg(e.message));
        }}
      >
        登録する
      </button>
    </div>
  );
}
