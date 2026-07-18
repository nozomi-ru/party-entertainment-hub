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
      className="relative overflow-hidden bg-white px-6 py-24 sm:px-8 sm:py-28"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[var(--gold-muted)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[var(--gold-muted)]/70 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-[var(--gold-deep)] uppercase">
            Features
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--charcoal)] sm:text-4xl">
            余興を、会場ごと盛り上げる機能
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            特別な機材や複雑な操作は不要。幹事さんもゲストも、その場ですぐに楽しめます。
          </p>
        </header>

        <ul className="mt-16 grid gap-8 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            const content = (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--charcoal)] text-[var(--gold-light)]">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--charcoal)]">
                      {feature.title}
                    </h3>
                    {feature.href ? (
                      <ArrowUpRight
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--gold-deep)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {feature.description}
                  </p>
                  {feature.href ? (
                    <p className="mt-3 text-xs font-medium tracking-wide text-[var(--gold-deep)]">
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
                    className="group flex gap-5 rounded-2xl border border-transparent p-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--cream)]/60"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex gap-5 rounded-2xl border border-transparent p-2">
                    {content}
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
