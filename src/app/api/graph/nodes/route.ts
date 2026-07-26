import { NextResponse } from "next/server";
import { buildGraph } from "@/lib/graph/build";
import {
  listGraphNodes,
  normalizeGraphRoom,
  normalizeGraphSide,
  normalizeGraphTags,
  putGraphNode,
  readGraphMeta,
} from "@/lib/graph/store";
import {
  GRAPH_MESSAGE_MAX,
  GRAPH_NAME_MAX,
  type GraphNodeRecord,
} from "@/lib/graph/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const room = normalizeGraphRoom(
    new URL(request.url).searchParams.get("room"),
  );
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }
  const nodes = await listGraphNodes(room);
  const graph = buildGraph(nodes);
  const meta = await readGraphMeta(room);
  return NextResponse.json({
    room,
    nodes,
    graph,
    expiresAt: meta?.expiresAt,
    createdAt: meta?.createdAt,
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const room = normalizeGraphRoom(body.room);
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }

  const user_id = String(body.user_id ?? body.guestId ?? "")
    .trim()
    .slice(0, 64);
  if (!user_id) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }

  const name = String(body.name ?? "")
    .trim()
    .slice(0, GRAPH_NAME_MAX);
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const side = normalizeGraphSide(body.side);
  if (!side) {
    return NextResponse.json(
      { error: "side must be groom or bride" },
      { status: 400 },
    );
  }

  const tags = normalizeGraphTags(body.tags ?? []);
  if (!tags || tags.length === 0) {
    return NextResponse.json(
      { error: "tags must include at least one tag" },
      { status: 400 },
    );
  }

  const message = String(body.message ?? "")
    .trim()
    .slice(0, GRAPH_MESSAGE_MAX);

  const record: GraphNodeRecord = {
    user_id,
    name,
    side,
    tags,
    message,
    timestamp: Date.now(),
  };

  await putGraphNode(room, record);
  const nodes = await listGraphNodes(room);
  const graph = buildGraph(nodes);
  const meta = await readGraphMeta(room);
  return NextResponse.json({
    room,
    node: record,
    nodes,
    graph,
    expiresAt: meta?.expiresAt,
    createdAt: meta?.createdAt,
  });
}
