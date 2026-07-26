import { NextResponse } from "next/server";
import { buildGraph } from "@/lib/graph/build";
import {
  extendGraphRoom,
  listGraphNodes,
  normalizeGraphRoom,
  openGraphRoom,
  readGraphMeta,
  resetGraphRoom,
} from "@/lib/graph/store";

export const dynamic = "force-dynamic";

/** Admin: open（ルーム確保） / reset（ノード全削除） */
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

  const op = String(body.op ?? "open");

  if (op === "reset") {
    const deleted = await resetGraphRoom(room);
    const nodes = await listGraphNodes(room);
    const meta = await readGraphMeta(room);
    return NextResponse.json({
      room,
      deleted,
      nodes,
      graph: buildGraph(nodes),
      expiresAt: meta?.expiresAt,
      createdAt: meta?.createdAt,
    });
  }

  if (op === "extend") {
    const meta = await extendGraphRoom(room);
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const nodes = await listGraphNodes(room);
    return NextResponse.json({
      room,
      nodes,
      graph: buildGraph(nodes),
      expiresAt: meta.expiresAt,
      createdAt: meta.createdAt,
    });
  }

  if (op === "open") {
    const created = await openGraphRoom(room);
    if (!created) {
      return NextResponse.json(
        { error: "Room already exists" },
        { status: 409 },
      );
    }
    const nodes = await listGraphNodes(room);
    const meta = await readGraphMeta(room);
    return NextResponse.json({
      room,
      nodes,
      graph: buildGraph(nodes),
      expiresAt: meta?.expiresAt,
      createdAt: meta?.createdAt,
    });
  }

  return NextResponse.json({ error: "Invalid op" }, { status: 400 });
}
