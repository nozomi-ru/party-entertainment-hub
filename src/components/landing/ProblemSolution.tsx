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
      className="relative bg-[var(--cream)] px-6 py-24 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-[var(--gold-deep)] uppercase">
            Problem & Solution
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--charcoal)] sm:text-4xl">
            幹事さんの不安に、そっと寄り添う
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            準備の忙しさと本番の緊張。その両方をやわらげるために、
            {siteConfig.name}は生まれました。
          </p>
        </header>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {problemSolutions.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <article
                key={item.id}
                className="group relative text-center md:text-left"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-white text-[var(--gold-deep)] shadow-sm transition-transform duration-500 group-hover:-translate-y-1 md:mx-0">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <p className="mt-5 font-[family-name:var(--font-display)] text-xs tracking-[0.2em] text-[var(--gold-deep)]">
                  0{index + 1}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--charcoal)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  <span className="block text-[var(--charcoal-soft)]">
                    {item.problem}
                  </span>
                  <span className="mt-3 block border-t border-[var(--gold)]/25 pt-3 text-[var(--charcoal)]">
                    {item.solution}
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
