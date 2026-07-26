import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DressAdminView } from "@/components/dress/DressAdminView";
import { DressGuestView } from "@/components/dress/DressGuestView";
import { DressScreenView } from "@/components/dress/DressScreenView";

type Props = {
  params: Promise<{ role: string }>;
};

const ROLES = ["guest", "screen", "admin"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  return {
    title: `お色直しドレス色当て (${role})`,
    robots: { index: false, follow: false },
  };
}

export default async function DressRolePage({ params }: Props) {
  const { role } = await params;
  if (!(ROLES as readonly string[]).includes(role)) {
    notFound();
  }

  if (role === "admin") {
    return (
      <Suspense
        fallback={
          <div className="dress-app">
            <p className="dress-hint">読み込み中…</p>
          </div>
        }
      >
        <DressAdminView />
      </Suspense>
    );
  }

  if (role === "screen") {
    return (
      <Suspense
        fallback={
          <div className="dress-app">
            <p className="dress-hint">読み込み中…</p>
          </div>
        }
      >
        <DressScreenView />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="dress-app">
          <p className="dress-hint">読み込み中…</p>
        </div>
      }
    >
      <DressGuestView />
    </Suspense>
  );
}
