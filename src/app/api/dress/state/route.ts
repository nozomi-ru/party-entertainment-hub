import { NextResponse } from "next/server";
import { getDressPublicSnapshot } from "@/lib/dress/store";

/** OpenNext では edge runtime 指定でビルド失敗するため未指定（他 API と同様） */
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getDressPublicSnapshot();
  return NextResponse.json(snapshot);
}
