import { NextResponse } from "next/server";
import { findDressColor } from "@/lib/dress/colors";
import {
  getDressPublicSnapshot,
  normalizeDressRoom,
  readDressColors,
  readDressState,
  writeDressVote,
} from "@/lib/dress/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const room = normalizeDressRoom(body.room);
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }

  const state = await readDressState(room);
  if (!state || state.status !== "voting") {
    return NextResponse.json({ error: "Voting closed" }, { status: 403 });
  }

  const userId = String(body.user_id ?? body.guestId ?? "").trim();
  if (!userId || userId.length > 64) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }

  const colors = await readDressColors(room);
  const color = String(body.color ?? "");
  if (!findDressColor(colors, color)) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 20);
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  await writeDressVote(room, {
    user_id: userId,
    name,
    color,
    timestamp: Date.now(),
  });

  const snapshot = await getDressPublicSnapshot(room);
  return NextResponse.json(snapshot);
}
