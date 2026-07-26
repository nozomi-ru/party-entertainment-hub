"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DressFrame } from "@/components/dress/DressFrame";
import { useGraphNodes } from "@/hooks/use-graph-nodes";
import { parseRoomParam } from "@/lib/live/room-code";
import type { GraphVizLink, GraphVizNode } from "@/lib/graph/types";

// 型定義が薄いため any 経由で dynamic import
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d") as Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
  { ssr: false },
);

type Tip = {
  name: string;
  tags: string[];
  message: string;
  x: number;
  y: number;
};

type GraphNode = GraphVizNode & { x?: number; y?: number };

export function GraphScreenView() {
  const router = useRouter();
  const search = useSearchParams();
  const roomFromUrl = parseRoomParam(search.get("room"));
  const [roomInput, setRoomInput] = useState(roomFromUrl);
  const room = roomFromUrl.length === 4 ? roomFromUrl : "";
  const { data, error, isLoading } = useGraphNodes(room || null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    setRoomInput(roomFromUrl);
  }, [roomFromUrl]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      setSize({
        w: el.clientWidth || 800,
        h: el.clientHeight || 600,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [room]);

  const graphData = useMemo(() => {
    if (!data?.graph) return { nodes: [] as GraphNode[], links: [] as GraphVizLink[] };
    const cx = size.w / 2;
    const cy = size.h / 2;
    const nodes: GraphNode[] = data.graph.nodes.map((n) => {
      if (n.id === "bride") {
        return { ...n, fx: cx - 56, fy: cy };
      }
      if (n.id === "groom") {
        return { ...n, fx: cx + 56, fy: cy };
      }
      return { ...n };
    });
    return {
      nodes,
      links: data.graph.links.map((l) => ({ ...l })),
    };
  }, [data?.graph, size.w, size.h]);

  if (!room) {
    return (
      <DressFrame
        titleEn="相関図"
        subtitle="Screen"
        lead="ルームコードを入力してください"
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
          onClick={() => router.replace(`/graph/screen?room=${roomInput}`)}
        >
          入室する
        </button>
      </DressFrame>
    );
  }

  if (isLoading && !data) {
    return (
      <DressFrame titleEn="相関図" subtitle="Screen" wide>
        <p className="dress-hint">同期中…</p>
      </DressFrame>
    );
  }

  if (error && !data) {
    return (
      <DressFrame titleEn="相関図" subtitle="Screen" wide>
        <p className="dress-error">読み込みに失敗しました</p>
      </DressFrame>
    );
  }

  return (
    <div className="graph-screen" data-testid="graph-screen">
      <header className="graph-screen-head">
        <p className="graph-screen-kicker">Guest Network</p>
        <h1 className="graph-screen-title">新郎新婦との相関図</h1>
        <p className="graph-screen-meta" data-testid="graph-screen-count">
          {data?.nodes.length ?? 0} 名が参加中 · ルーム {room}
        </p>
      </header>

      <div className="graph-screen-canvas" ref={wrapRef}>
        <ForceGraph2D
          width={size.w}
          height={size.h}
          graphData={graphData}
          nodeRelSize={6}
          linkColor={(l: GraphVizLink) =>
            l.kind === "tag"
              ? "rgba(180,151,90,0.35)"
              : "rgba(26,26,26,0.28)"
          }
          linkWidth={(l: GraphVizLink) => (l.kind === "tag" ? 1 : 1.6)}
          linkDirectionalParticles={(l: GraphVizLink) =>
            l.kind === "couple" ? 1 : 0
          }
          linkDirectionalParticleWidth={1.2}
          linkDirectionalParticleSpeed={0.004}
          onNodeClick={(node: GraphNode, event: MouseEvent) => {
            if (node.kind !== "guest") {
              setTip(null);
              return;
            }
            setTip({
              name: node.name,
              tags: node.tags ?? [],
              message: node.message ?? "",
              x: event.clientX,
              y: event.clientY,
            });
          }}
          onBackgroundClick={() => setTip(null)}
          nodeCanvasObject={(
            node: GraphNode,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
          ) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const isCouple = node.kind === "couple";
            const r = (isCouple ? 14 : 7) / Math.max(globalScale * 0.85, 0.6);
            let fill = "#5c6b78";
            if (node.side === "bride" || node.id === "bride") fill = "#c98b9a";
            if (node.id === "groom") fill = "#5c6b78";
            if (isCouple) {
              ctx.beginPath();
              ctx.arc(x, y, r + 3 / globalScale, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(180,151,90,0.35)";
              ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = isCouple ? "#b4975a" : "rgba(26,26,26,0.35)";
            ctx.lineWidth = (isCouple ? 2 : 1) / globalScale;
            ctx.stroke();

            const fontSize = (isCouple ? 13 : 11) / globalScale;
            ctx.font = `${fontSize}px "Noto Serif JP", serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#1a1a1a";
            ctx.fillText(node.name, x, y + r + 3 / globalScale);
          }}
          nodePointerAreaPaint={(
            node: GraphNode,
            color: string,
            ctx: CanvasRenderingContext2D,
          ) => {
            const r = node.kind === "couple" ? 16 : 10;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
          }}
        />
      </div>

      {tip && (
        <div
          className="graph-tip"
          data-testid="graph-tip"
          style={{ left: tip.x + 12, top: tip.y + 12 }}
        >
          <p className="graph-tip-name">{tip.name}</p>
          {tip.tags.length > 0 && (
            <p className="graph-tip-tags">{tip.tags.join(" · ")}</p>
          )}
          {tip.message ? (
            <p className="graph-tip-msg">{tip.message}</p>
          ) : (
            <p className="graph-tip-msg">メッセージなし</p>
          )}
        </div>
      )}
    </div>
  );
}
