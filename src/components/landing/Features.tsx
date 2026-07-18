import {
  ArrowUpRight,
  BarChart3,
  Grid3x3,
  HelpCircle,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { features, type FeatureItem } from "@/config/site";

const iconMap: Record<FeatureItem["icon"], LucideIcon> = {
  "help-circle": HelpCircle,
  "bar-chart": BarChart3,
  smartphone: Smartphone,
  sparkles: Sparkles,
  grid: Grid3x3,
};

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-atmosphere-inverse px-6 py-28 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.35em] text-[var(--champagne-deep)] uppercase">
            Features
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--ink)] sm:text-[2.5rem] sm:leading-tight">
            余興を、会場ごと盛り上げる機能
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem] sm:leading-7">
            特別な機材や複雑な操作は不要。幹事さんもゲストも、その場ですぐに楽しめます。
          </p>
        </header>

        <ul className="mt-20 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            const inner = (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--ink)] text-[var(--champagne-soft)] transition-colors duration-500 group-hover:bg-[var(--champagne-deep)] group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide text-[var(--ink)] sm:text-xl">
                      {feature.title}
                    </h3>
                    {feature.href ? (
                      <ArrowUpRight
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--champagne-deep)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    {feature.description}
                  </p>
                  {feature.href ? (
                    <p className="mt-3 text-xs font-medium tracking-[0.15em] text-[var(--champagne-deep)]">
                      アプリを開く
                    </p>
                  ) : null}
                </div>
              </>
            );

            return (
              <li key={feature.id}>
                {feature.href ? (
                  <a
                    href={feature.href}
                    className="group flex gap-5 px-1 py-7 transition-colors sm:gap-6 sm:py-8"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex gap-5 px-1 py-7 sm:gap-6 sm:py-8">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
