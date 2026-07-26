import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GraphAdminView } from "@/components/graph/GraphAdminView";
import { GraphGuestView } from "@/components/graph/GraphGuestView";
import { GraphScreenView } from "@/components/graph/GraphScreenView";

type Props = {
  params: Promise<{ role: string }>;
};

const ROLES = ["guest", "screen", "admin"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  return {
    title: `相関図ジェネレーター (${role})`,
    robots: { index: false, follow: false },
  };
}

export default async function GraphRolePage({ params }: Props) {
  const { role } = await params;
  if (!(ROLES as readonly string[]).includes(role)) {
    notFound();
  }

  const fallback = (
    <div className="dress-app">
      <p className="dress-hint">読み込み中…</p>
    </div>
  );

  if (role === "admin") {
    return (
      <Suspense fallback={fallback}>
        <GraphAdminView />
      </Suspense>
    );
  }
  if (role === "screen") {
    return (
      <Suspense fallback={fallback}>
        <GraphScreenView />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={fallback}>
      <GraphGuestView />
    </Suspense>
  );
}
