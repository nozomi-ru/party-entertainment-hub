import { NextResponse } from "next/server";
import { normalizeRoom } from "@/lib/poll";
import {
  extendBingoSession,
  openBingoSession,
  readBingoSession,
  writeBingoSession,
  type BingoEntry,
} from "@/lib/bingo-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ room: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { room: raw } = await context.params;
  const room = normalizeRoom(raw);
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }
  const session = await readBingoSession(room);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function POST(request: Request, context: RouteContext) {
  const { room: raw } = await context.params;
  const room = normalizeRoom(raw);
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action || "");

  if (action === "open") {
    const session = await openBingoSession(room);
    if (!session) {
      return NextResponse.json(
        { error: "Room already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(session);
  }

  if (action === "extend") {
    const session = await extendBingoSession(room);
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  const current = await readBingoSession(room);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "report") {
    const name = String(body.name ?? "").trim().slice(0, 50);
    if (!name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const entry: BingoEntry = { name, reportedAt: Date.now() };
    current.entries.push(entry);
    await writeBingoSession(current);
    return NextResponse.json(current);
  }

  if (action === "clear") {
    current.entries = [];
    await writeBingoSession(current);
    return NextResponse.json(current);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
