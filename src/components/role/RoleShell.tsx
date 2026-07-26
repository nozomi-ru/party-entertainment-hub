import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

type RoleShellProps = {
  role: "guest" | "screen" | "admin";
  title: string;
  description: string;
  children?: ReactNode;
};

const ROLE_LABEL: Record<RoleShellProps["role"], string> = {
  guest: "Guest",
  screen: "Screen",
  admin: "Admin",
};

export function RoleShell({
  role,
  title,
  description,
  children,
}: RoleShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--ink)]"
          >
            {siteConfig.name}
          </Link>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {ROLE_LABEL[role]}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
