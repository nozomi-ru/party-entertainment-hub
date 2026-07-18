import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Package,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { affiliateItems, type AffiliateItem } from "@/config/site";

const iconMap: Record<AffiliateItem["icon"], LucideIcon> = {
  "shopping-bag": ShoppingBag,
  package: Package,
  award: Award,
};

export function Affiliate() {
  return (
    <section
      id="affiliate"
      className="relative overflow-hidden bg-atmosphere px-6 py-28 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.35em] text-[var(--champagne-deep)] uppercase">
            Recommendations
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--ink)] sm:text-[2.5rem] sm:leading-tight">
            景品・ギフトのおすすめ
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem] sm:leading-7">
            余興の盛り上がりを支える、景品選びの参考リンクです。必要に応じて差し替えてご利用ください。
          </p>
        </header>

        <div className="mt-16 grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {affiliateItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex flex-col bg-[var(--surface)] p-7 transition-colors duration-300 hover:bg-[var(--ink)] sm:p-8"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.25em] text-[var(--champagne-deep)] uppercase transition-colors group-hover:text-[var(--champagne-soft)]">
                    {item.badge}
                  </span>
                  <Icon
                    className="h-4 w-4 text-[var(--ink-soft)] transition-colors group-hover:text-[var(--champagne-soft)]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-wide text-[var(--ink)] transition-colors group-hover:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)] transition-colors group-hover:text-white/70">
                  {item.description}
                </p>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--champagne-deep)] transition-colors group-hover:text-[var(--champagne-soft)]">
                  ショップを見る
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
