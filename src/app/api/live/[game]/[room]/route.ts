import { NextResponse } from "next/server";
import { isLiveGameId } from "@/lib/live/catalog";
import { handleLiveAdmin, handleLiveGuest } from "@/lib/live/handlers";
import { ensureLiveState, getLiveSnapshot } from "@/lib/live/store";
import { normalizeRoom } from "@/lib/poll";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type RouteContext = {
  params: Promise<{ game: string; room: string }>;
};

async function parseParams(context: RouteContext) {
  const { game: rawGame, room: rawRoom } = await context.params;
  if (!isLiveGameId(rawGame)) {
    return { error: NextResponse.json({ error: "Invalid game" }, { status: 400 }) };
  }
  const room = normalizeRoom(rawRoom);
  if (room.length !== 4) {
    return { error: NextResponse.json({ error: "Invalid room" }, { status: 400 }) };
  }
  return { game: rawGame, room };
}

export async function GET(_request: Request, context: RouteContext) {
  const parsed = await parseParams(context);
  if ("error" in parsed && parsed.error) return parsed.error;
  const { game, room } = parsed as { game: import("@/lib/live/catalog").LiveGameId; room: string };

  await ensureLiveState(game, room);
  const snap = await getLiveSnapshot(game, room);
  return NextResponse.json(snap, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const parsed = await parseParams(context);
  if ("error" in parsed && parsed.error) return parsed.error;
  const { game, room } = parsed as { game: import("@/lib/live/catalog").LiveGameId; room: string };

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = String(body.role ?? "");
  try {
    if (role === "admin") {
      const snap = await handleLiveAdmin(game, room, body);
      return NextResponse.json(snap);
    }
    if (role === "guest") {
      const snap = await handleLiveGuest(game, room, body);
      return NextResponse.json(snap);
    }
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
