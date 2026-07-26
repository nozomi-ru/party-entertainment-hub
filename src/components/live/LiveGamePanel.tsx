"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { LiveRole } from "@/components/live/LiveShell";
import { useGuestSession } from "@/hooks/use-guest-session";
import { useLiveRoom } from "@/hooks/use-live-room";
import type { LiveGameId } from "@/lib/live/catalog";
import { buildBingoCard, countBingoLines } from "@/lib/live/summary";
import type { LiveSnapshot } from "@/lib/live/types";

const ForceGraph = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type Props = {
  game: LiveGameId;
  role: LiveRole;
  room: string;
  displayName: string;
  spotParam: string;
};

export function LiveGamePanel({
  game,
  role,
  room,
  displayName,
  spotParam,
}: Props) {
  const { guestId, ready } = useGuestSession();
  const { snapshot, error, isLoading, admin, guest } = useLiveRoom(game, room);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (
      game === "treasure" &&
      role === "guest" &&
      ready &&
      guestId &&
      spotParam &&
      snapshot?.state.game === "treasure" &&
      snapshot.state.phase === "hunting"
    ) {
      void guest("spot", { spotId: spotParam }, guestId, displayName).catch(
        (e: Error) => setMsg(e.message),
      );
    }
    // 初回スポット取得のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, guestId, spotParam, snapshot?.state.phase]);

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
      {game === "buzz" && <BuzzPanel {...common} />}
      {game === "digibingo" && <BingoPanel {...common} />}
      {game === "either" && <EitherPanel {...common} />}
      {game === "dress" && <DressPanel {...common} />}
      {game === "treasure" && <TreasurePanel {...common} spotParam={spotParam} />}
      {game === "grade" && <GradePanel {...common} />}
      {game === "request" && <RequestPanel {...common} />}
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

function BuzzPanel(p: PanelProps) {
  const state = p.snapshot.state;
  if (state.game !== "buzz") return null;
  const summary = p.snapshot.summary as {
    winner: { name: string } | null;
    order: { rank: number; name: string }[];
  };

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="buzz-arm" onClick={() => void p.admin("arm")}>
            早押し開始
          </Btn>
          <Btn testId="buzz-lock" onClick={() => void p.admin("lock")}>
            締める
          </Btn>
          <Btn testId="buzz-reveal" onClick={() => void p.admin("reveal")}>
            正解発表
          </Btn>
          <Btn testId="buzz-next" onClick={() => void p.admin("next")}>
            次の問題
          </Btn>
        </AdminBar>
        <p data-testid="buzz-phase">フェーズ: {state.phase}</p>
        <p className="mt-2 text-xl">{state.question}</p>
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div className="text-center">
        <p className="text-sm tracking-[0.3em] text-[var(--champagne-soft)] uppercase">
          Buzz Quiz
        </p>
        <motion.h2
          key={state.round + state.question}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 font-[family-name:var(--font-display)] text-4xl sm:text-5xl"
        >
          {state.question}
        </motion.h2>
        {state.phase === "reveal" && (
          <p className="mt-8 text-2xl text-[var(--champagne-soft)]">
            正解: {state.answer}
          </p>
        )}
        {summary.winner && state.phase !== "lobby" && (
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-10 text-3xl"
            data-testid="buzz-winner"
          >
            最速: {summary.winner.name}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xl">{state.question}</p>
      <button
        type="button"
        disabled={!p.ready || !p.guestId || state.phase !== "armed"}
        className="h-28 w-full bg-[var(--champagne)] text-2xl font-semibold text-[var(--ink)] disabled:opacity-40"
        data-testid="buzz-button"
        onClick={() => {
          if (!p.guestId) return;
          void p
            .guest("buzz", { round: state.round }, p.guestId, p.displayName)
            .catch((e: Error) => p.setMsg(e.message));
        }}
      >
        早押し！
      </button>
      {state.phase === "reveal" && (
        <p data-testid="buzz-answer">正解: {state.answer}</p>
      )}
    </div>
  );
}

function BingoPanel(p: PanelProps) {
  const state = p.snapshot.state;
  const max = state.game === "digibingo" ? state.max : 75;
  const drawn = state.game === "digibingo" ? state.drawn : [];
  const card = useMemo(
    () => (p.guestId ? buildBingoCard(p.guestId, max) : []),
    [p.guestId, max],
  );
  const lines = countBingoLines(card, drawn);
  const last = drawn[drawn.length - 1];
  if (state.game !== "digibingo") return null;

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="bingo-draw" onClick={() => void p.admin("draw")}>
            数字を抽選
          </Btn>
        </AdminBar>
        <p data-testid="bingo-drawn-count">抽選済み: {drawn.length}</p>
        <p className="mt-4 text-5xl font-[family-name:var(--font-display)]">
          {last ?? "—"}
        </p>
        <p className="mt-4 text-sm text-[var(--muted)]">{drawn.join(", ")}</p>
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div className="text-center">
        <p className="tracking-[0.3em] uppercase text-[var(--champagne-soft)]">
          Digital Bingo
        </p>
        <motion.p
          key={last}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-10 font-[family-name:var(--font-display)] text-8xl"
          data-testid="bingo-last"
        >
          {last ?? "READY"}
        </motion.p>
        <p className="mt-8 text-white/70">{drawn.join(" · ")}</p>
      </div>
    );
  }

  const set = new Set(drawn);
  return (
    <div>
      <p className="mb-3 text-sm" data-testid="bingo-lines">
        ビンゴライン: {lines}
      </p>
      <div className="grid grid-cols-5 gap-1" data-testid="bingo-card">
        {card.map((n, i) => {
          const free = i === 12;
          const on = free || set.has(n);
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center text-sm ${
                on
                  ? "bg-[var(--ink)] text-white"
                  : "border border-[var(--line)] bg-white"
              }`}
            >
              {free ? "★" : n}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EitherPanel(p: PanelProps) {
  const state = p.snapshot.state;
  if (state.game !== "either") return null;
  const summary = p.snapshot.summary as {
    left: number;
    right: number;
    leftPct: number;
    rightPct: number;
    total: number;
  };

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="either-open" onClick={() => void p.admin("openVote")}>
            投票開始
          </Btn>
          <Btn testId="either-results" onClick={() => void p.admin("showResults")}>
            結果表示
          </Btn>
        </AdminBar>
        <p className="text-xl">{state.question}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {state.left} / {state.right} · 票 {summary.total}
        </p>
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div>
        <h2 className="text-center font-[family-name:var(--font-display)] text-4xl">
          {state.question}
        </h2>
        {(state.phase === "results" || p.role === "screen") && (
          <div className="mt-12 space-y-6">
            <Bar label={state.left} pct={summary.leftPct} count={summary.left} />
            <Bar label={state.right} pct={summary.rightPct} count={summary.right} />
          </div>
        )}
      </div>
    );
  }

  const showResults = state.phase === "results";
  return (
    <div className="space-y-4">
      <p className="text-xl">{state.question}</p>
      {!showResults && (
        <div className="grid grid-cols-2 gap-3">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              disabled={!p.ready || !p.guestId || state.phase !== "voting"}
              className="min-h-28 border border-[var(--line)] bg-white px-3 py-6 text-lg disabled:opacity-40"
              data-testid={`either-${side}`}
              onClick={() => {
                if (!p.guestId) return;
                void p
                  .guest("vote", { side }, p.guestId, p.displayName)
                  .catch((e: Error) => p.setMsg(e.message));
              }}
            >
              {side === "left" ? state.left : state.right}
            </button>
          ))}
        </div>
      )}
      {showResults && (
        <div data-testid="either-guest-results">
          <Bar label={state.left} pct={summary.leftPct} count={summary.left} />
          <Bar label={state.right} pct={summary.rightPct} count={summary.right} />
        </div>
      )}
    </div>
  );
}

function Bar({
  label,
  pct,
  count,
}: {
  label: string;
  pct: number;
  count: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {count}（{pct}%）
        </span>
      </div>
      <div className="h-4 bg-white/20">
        <motion.div
          className="h-full bg-[var(--champagne)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DressPanel(p: PanelProps) {
  const state = p.snapshot.state;
  if (state.game !== "dress") return null;
  const summary = p.snapshot.summary as {
    winners: { name: string }[];
    counts: Record<number, number>;
  };

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="dress-open" onClick={() => void p.admin("openVote")}>
            投票開始
          </Btn>
          {state.colors.map((c, i) => (
            <Btn
              key={c}
              testId={`dress-reveal-${i}`}
              onClick={() => void p.admin("reveal", { correctIndex: i })}
            >
              正解: {c}
            </Btn>
          ))}
        </AdminBar>
        <p>フェーズ: {state.phase}</p>
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl">
          ドレスの色は？
        </h2>
        {state.phase === "reveal" && state.correctIndex != null && (
          <>
            <p className="mt-8 text-3xl" data-testid="dress-correct">
              正解: {state.colors[state.correctIndex]}
            </p>
            <details className="mx-auto mt-8 max-w-md text-left" open>
              <summary className="cursor-pointer text-lg">正解者一覧</summary>
              <ul className="mt-3 space-y-1" data-testid="dress-winners">
                {summary.winners.map((w) => (
                  <li key={w.name}>{w.name}</li>
                ))}
              </ul>
            </details>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {state.colors.map((c, i) => (
        <button
          key={c}
          type="button"
          disabled={!p.ready || !p.guestId || state.phase !== "voting"}
          className="min-h-20 border border-[var(--line)] bg-white py-4 disabled:opacity-40"
          data-testid={`dress-color-${i}`}
          onClick={() => {
            if (!p.guestId) return;
            void p
              .guest("color", { colorIndex: i }, p.guestId, p.displayName)
              .catch((e: Error) => p.setMsg(e.message));
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function TreasurePanel(p: PanelProps & { spotParam: string }) {
  const state = p.snapshot.state;
  if (state.game !== "treasure") return null;
  const summary = p.snapshot.summary as {
    ranking: { name: string; points: number }[];
  };

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="treasure-start" onClick={() => void p.admin("start")}>
            宝探し開始
          </Btn>
        </AdminBar>
        <ul className="mt-4 space-y-2 text-sm">
          {state.spots.map((s) => (
            <li key={s.id} className="break-all">
              {s.label} ({s.points}pt): /live/treasure/guest?room={state.room}
              &spot={s.id}
            </li>
          ))}
        </ul>
        <ol className="mt-6 list-decimal pl-5" data-testid="treasure-rank">
          {summary.ranking.map((r) => (
            <li key={r.name}>
              {r.name}: {r.points}pt
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div>
        <h2 className="text-center font-[family-name:var(--font-display)] text-4xl">
          宝探しランキング
        </h2>
        <ol className="mx-auto mt-10 max-w-md space-y-3 text-2xl">
          {summary.ranking.map((r, i) => (
            <li key={r.name}>
              {i + 1}. {r.name} — {r.points}pt
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div>
      <p data-testid="treasure-status">
        {state.phase === "hunting"
          ? p.spotParam
            ? `スポット ${p.spotParam} を記録しました`
            : "QR を読み取ってポイントを集めよう"
          : "開始待ち"}
      </p>
      <ol className="mt-4 list-decimal pl-5">
        {summary.ranking.slice(0, 5).map((r) => (
          <li key={r.name}>
            {r.name}: {r.points}
          </li>
        ))}
      </ol>
    </div>
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

function RequestPanel(p: PanelProps) {
  const [text, setText] = useState("");
  const state = p.snapshot.state;
  if (state.game !== "request") return null;
  const summary = p.snapshot.summary as {
    ranking: { id: string; text: string; likes: number; name: string }[];
  };

  if (p.role === "admin") {
    return (
      <div>
        <AdminBar>
          <Btn testId="request-open" onClick={() => void p.admin("open")}>
            受付中
          </Btn>
          <Btn testId="request-close" onClick={() => void p.admin("close")}>
            締め切る
          </Btn>
        </AdminBar>
        <RankList ranking={summary.ranking} />
      </div>
    );
  }

  if (p.role === "screen") {
    return (
      <div>
        <h2 className="text-center font-[family-name:var(--font-display)] text-4xl">
          {state.title}
        </h2>
        <div className="mt-10">
          <RankList ranking={summary.ranking} large />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state.phase === "open" && (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-[var(--line)] px-3 py-3"
            value={text}
            maxLength={80}
            onChange={(e) => setText(e.target.value)}
            data-testid="request-input"
            placeholder="やってほしいこと"
          />
          <button
            type="button"
            className="bg-[var(--ink)] px-4 text-white"
            data-testid="request-post"
            onClick={() => {
              if (!p.guestId || !text.trim()) return;
              void p
                .guest("post", { text }, p.guestId, p.displayName)
                .then(() => setText(""))
                .catch((e: Error) => p.setMsg(e.message));
            }}
          >
            投稿
          </button>
        </div>
      )}
      <ul className="space-y-2" data-testid="request-list">
        {summary.ranking.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between border border-[var(--line)] bg-white px-3 py-3"
          >
            <span>
              {r.text}{" "}
              <span className="text-xs text-[var(--muted)]">— {r.name}</span>
            </span>
            <button
              type="button"
              className="text-sm"
              data-testid={`request-like-${r.id}`}
              onClick={() => {
                if (!p.guestId) return;
                void p
                  .guest("like", { postId: r.id }, p.guestId, p.displayName)
                  .catch((e: Error) => p.setMsg(e.message));
              }}
            >
              ♥ {r.likes}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankList({
  ranking,
  large,
}: {
  ranking: { id: string; text: string; likes: number }[];
  large?: boolean;
}) {
  return (
    <ol
      className={large ? "space-y-4 text-2xl" : "space-y-2 text-sm"}
      data-testid="request-rank"
    >
      {ranking.map((r, i) => (
        <li key={r.id}>
          {i + 1}. {r.text}（{r.likes}）
        </li>
      ))}
    </ol>
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
