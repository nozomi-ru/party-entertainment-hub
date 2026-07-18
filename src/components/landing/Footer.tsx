import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--ink)] px-6 py-12 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-[var(--champagne-soft)] uppercase">
            {siteConfig.nameEn}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-wide text-white">
            {siteConfig.name}
          </p>
        </div>
        <p className="text-xs tracking-wide text-white/45">
          &copy; {siteConfig.copyrightYear} {siteConfig.author}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
