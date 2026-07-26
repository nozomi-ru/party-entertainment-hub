import { NextResponse } from "next/server";
import {
  newWishId,
  normalizeWishEntry,
  normalizeWishRoom,
  normalizeWishTitle,
} from "@/lib/wish";
import {
  readWishSession,
  toGuestView,
  writeWishSession,
  WISH_LIMITS,
  type WishSession,
} from "@/lib/wish-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ room: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { room: raw } = await context.params;
  const room = normalizeWishRoom(raw);
  if (room.length !== 4) {
    return NextResponse.json({ error: "Invalid room" }, { status: 400 });
  }

  const session = await readWishSession(room);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  if (role === "guest") {
    return NextResponse.json(toGuestView(session));
  }
  return NextResponse.json(session);
}

export async function POST(request: Request, context: RouteContext) {
  const { room: raw } = await context.params;
  const room = normalizeWishRoom(raw);
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
    const existing = await readWishSession(room);
    const session: WishSession = {
      room,
      title: normalizeWishTitle(body.title ?? existing?.title),
      showWall:
        body.showWall !== undefined
          ? Boolean(body.showWall)
          : (existing?.showWall ?? false),
      messages: existing?.messages ?? [],
      updatedAt: Date.now(),
    };
    // title だけ更新したいとき、messages を消さない
    if (body.clearMessages === true) {
      session.messages = [];
    }
    await writeWishSession(session);
    return NextResponse.json(session);
  }

  const current = await readWishSession(room);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "post") {
    const entry = normalizeWishEntry(body.name, body.text);
    if (!entry.ok) {
      return NextResponse.json(
        { error: "name and text required" },
        { status: 400 },
      );
    }
    if (current.messages.length >= WISH_LIMITS.maxMessages) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }
    current.messages.push({
      id: newWishId(),
      name: entry.name,
      text: entry.text,
      createdAt: Date.now(),
    });
    current.updatedAt = Date.now();
    await writeWishSession(current);
    return NextResponse.json(current);
  }

  if (action === "toggleWall") {
    current.showWall = !current.showWall;
    current.updatedAt = Date.now();
    await writeWishSession(current);
    return NextResponse.json(current);
  }

  if (action === "setWall") {
    current.showWall = Boolean(body.showWall);
    current.updatedAt = Date.now();
    await writeWishSession(current);
    return NextResponse.json(current);
  }

  if (action === "clear") {
    current.messages = [];
    current.updatedAt = Date.now();
    await writeWishSession(current);
    return NextResponse.json(current);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
