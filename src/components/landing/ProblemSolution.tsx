import { ClipboardList, Gift, Users, type LucideIcon } from "lucide-react";
import {
  problemSolutions,
  siteConfig,
  type ProblemSolutionItem,
} from "@/config/site";

const iconMap: Record<ProblemSolutionItem["icon"], LucideIcon> = {
  clipboard: ClipboardList,
  gift: Gift,
  users: Users,
};

export function ProblemSolution() {
  return (
    <section
      id="solutions"
      className="relative overflow-hidden bg-atmosphere px-6 py-28 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.35em] text-[var(--champagne-deep)] uppercase">
            Problem & Solution
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--ink)] sm:text-[2.5rem] sm:leading-tight">
            幹事さんの不安に、そっと寄り添う
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem] sm:leading-7">
            準備の忙しさと本番の緊張。その両方をやわらげるために、
            {siteConfig.name}は生まれました。
          </p>
        </header>

        <div className="mt-20 grid gap-12 md:grid-cols-3 md:gap-10">
          {problemSolutions.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <article key={item.id} className="group relative text-left">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border border-[var(--champagne)]/35 bg-[var(--surface)] text-[var(--champagne-deep)] transition-colors duration-500 group-hover:border-[var(--champagne)] group-hover:bg-[var(--ink)] group-hover:text-[var(--champagne-soft)]">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.25em] text-[var(--champagne-deep)]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold tracking-wide text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {item.problem}
                </p>
                <p className="mt-4 border-l-2 border-[var(--champagne)]/50 pl-4 text-sm leading-7 text-[var(--ink-soft)]">
                  {item.solution}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
