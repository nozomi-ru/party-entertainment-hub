import { NextResponse } from "next/server";
import { isDressColorId } from "@/lib/dress/colors";
import {
  getDressPublicSnapshot,
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

  const status = String(body.status ?? "");
  if (status !== "voting" && status !== "closed" && status !== "result") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  let next: DressStateRecord;

  if (status === "voting") {
    next = { status: "voting", correct_color: null };
  } else if (status === "closed") {
    next = { status: "closed", correct_color: null };
  } else {
    const correct = String(body.correct_color ?? "");
    if (!isDressColorId(correct)) {
      return NextResponse.json(
        { error: "correct_color required for result" },
        { status: 400 },
      );
    }
    next = { status: "result", correct_color: correct };
  }

  await writeDressState(next);
  const snapshot = await getDressPublicSnapshot();
  return NextResponse.json(snapshot);
}
