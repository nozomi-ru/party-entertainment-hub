import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white px-6 py-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-wide text-[var(--charcoal)]">
          {siteConfig.name}
        </p>
        <p className="text-xs text-[var(--muted)]">
          &copy; {siteConfig.copyrightYear} {siteConfig.author}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
