import { NextResponse } from "next/server";
import { normalizeRoom } from "@/lib/poll";
import {
  extendQuizSession,
  openQuizSession,
  readQuizSession,
  writeQuizSession,
  type QuizEntry,
} from "@/lib/quiz-store";

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
  const session = await readQuizSession(room);
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
    const session = await openQuizSession(room);
    if (!session) {
      return NextResponse.json(
        { error: "Room already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(session);
  }

  if (action === "extend") {
    const session = await extendQuizSession(room);
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  const current = await readQuizSession(room);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "submit") {
    const name = String(body.name ?? "").trim().slice(0, 50);
    const score = Number(body.score);
    const total = Number(body.total);
    if (
      !name ||
      !Number.isInteger(score) ||
      !Number.isInteger(total) ||
      score < 0 ||
      total < 1 ||
      score > total
    ) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }
    const entry: QuizEntry = { name, score, total, submittedAt: Date.now() };
    current.entries.push(entry);
    await writeQuizSession(current);
    return NextResponse.json(current);
  }

  if (action === "clear") {
    current.entries = [];
    await writeQuizSession(current);
    return NextResponse.json(current);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
