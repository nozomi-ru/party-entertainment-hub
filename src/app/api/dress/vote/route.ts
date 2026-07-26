import { NextResponse } from "next/server";
import { isDressColorId } from "@/lib/dress/colors";
import {
  getDressPublicSnapshot,
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

  const state = await readDressState();
  if (!state || state.status !== "voting") {
    return NextResponse.json({ error: "Voting closed" }, { status: 403 });
  }

  const userId = String(body.user_id ?? body.guestId ?? "").trim();
  if (!userId || userId.length > 64) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }

  const color = String(body.color ?? "");
  if (!isDressColorId(color)) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  const name = String(body.name ?? "ゲスト").trim().slice(0, 20) || "ゲスト";

  await writeDressVote({
    user_id: userId,
    name,
    color,
    timestamp: Date.now(),
  });

  const snapshot = await getDressPublicSnapshot();
  return NextResponse.json(snapshot);
}
