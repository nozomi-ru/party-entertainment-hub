import { NextResponse } from "next/server";
import {
  getDressPublicSnapshot,
  normalizeDressRoom,
} from "@/lib/dress/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const room = normalizeDressRoom(new URL(request.url).searchParams.get("room"));
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }
  const snapshot = await getDressPublicSnapshot(room);
  return NextResponse.json(snapshot);
}
