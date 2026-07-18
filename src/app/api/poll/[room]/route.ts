import { NextResponse } from "next/server";
import { normalizeRoom, normalizeVotes } from "@/lib/poll";
import {
  readPollSession,
  writePollSession,
  type PollQuestion,
  type PollSession,
} from "@/lib/poll-store";

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

  const session = await readPollSession(room);
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

  if (action === "upsert") {
    const questions = body.questions as PollQuestion[] | undefined;
    const votes = body.votes as number[][] | undefined;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "questions required" }, { status: 400 });
    }

    const rawIndex = Number(body.index);
    const index =
      Number.isInteger(rawIndex) &&
      rawIndex >= 0 &&
      rawIndex < questions.length
        ? rawIndex
        : 0;

    const session: PollSession = {
      room,
      index,
      showResults: Boolean(body.showResults),
      votes: normalizeVotes(questions, votes),
      questions,
      updatedAt: Date.now(),
    };
    await writePollSession(session);
    return NextResponse.json(session);
  }

  const current = await readPollSession(room);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "vote" || action === "tally") {
    const questionIndex = Number(body.questionIndex);
    const choiceIndex = Number(body.choiceIndex);
    if (
      !Number.isInteger(questionIndex) ||
      !Number.isInteger(choiceIndex) ||
      questionIndex < 0 ||
      questionIndex >= current.questions.length ||
      choiceIndex < 0 ||
      choiceIndex >= current.questions[questionIndex].choices.length
    ) {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    // 読み取り→加算→書き込み（同時投票で稀に取りこぼす可能性あり。二次会規模では実用十分）
    current.votes[questionIndex][choiceIndex] += 1;
    if (action === "tally") current.showResults = true;
    current.updatedAt = Date.now();
    await writePollSession(current);
    return NextResponse.json(current);
  }

  if (action === "setIndex") {
    const index = Number(body.index);
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= current.questions.length
    ) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }
    current.index = index;
    current.showResults = false;
    current.updatedAt = Date.now();
    await writePollSession(current);
    return NextResponse.json(current);
  }

  if (action === "toggleResults") {
    current.showResults = !current.showResults;
    current.updatedAt = Date.now();
    await writePollSession(current);
    return NextResponse.json(current);
  }

  if (action === "clearVotes") {
    const q = current.questions[current.index];
    current.votes[current.index] = Array(q.choices.length).fill(0);
    current.updatedAt = Date.now();
    await writePollSession(current);
    return NextResponse.json(current);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
