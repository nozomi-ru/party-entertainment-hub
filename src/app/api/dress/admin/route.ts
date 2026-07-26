import { NextResponse } from "next/server";
import { findDressColor, normalizeDressColors } from "@/lib/dress/colors";
import {
  extendDressRoom,
  getDressPublicSnapshot,
  normalizeDressRoom,
  openDressRoom,
  readDressColors,
  writeDressColors,
  writeDressState,
  type DressStateRecord,
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

  const op = String(body.op ?? "");

  if (op === "open") {
    const created = await openDressRoom(room);
    if (!created) {
      return NextResponse.json(
        { error: "Room already exists" },
        { status: 409 },
      );
    }
    const snapshot = await getDressPublicSnapshot(room);
    return NextResponse.json(snapshot);
  }

  if (op === "extend") {
    const meta = await extendDressRoom(room);
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const snapshot = await getDressPublicSnapshot(room);
    return NextResponse.json(snapshot);
  }

  if (op === "setColors" || body.colors != null) {
    const colors = normalizeDressColors(body.colors);
    if (!colors) {
      return NextResponse.json(
        { error: "colors must be 2–8 items with label and #RRGGBB fill" },
        { status: 400 },
      );
    }
    await writeDressColors(room, colors);
    if (!body.status) {
      const snapshot = await getDressPublicSnapshot(room);
      return NextResponse.json(snapshot);
    }
  }

  const status = String(body.status ?? "");
  if (status !== "voting" && status !== "closed" && status !== "result") {
    if (op === "setColors") {
      const snapshot = await getDressPublicSnapshot(room);
      return NextResponse.json(snapshot);
    }
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  let next: DressStateRecord;
  const colors = await readDressColors(room);

  if (status === "voting") {
    next = { status: "voting", correct_color: null };
  } else if (status === "closed") {
    next = { status: "closed", correct_color: null };
  } else {
    const correct = String(body.correct_color ?? "");
    if (!findDressColor(colors, correct)) {
      return NextResponse.json(
        { error: "correct_color must match a configured color id" },
        { status: 400 },
      );
    }
    next = { status: "result", correct_color: correct };
  }

  await writeDressState(room, next);
  const snapshot = await getDressPublicSnapshot(room);
  return NextResponse.json(snapshot);
}
