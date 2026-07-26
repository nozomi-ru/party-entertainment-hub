import { ArrowUpRight } from "lucide-react";
import { toolCategories, toolItems, type ToolItem } from "@/config/site";

const CATEGORY_ORDER: ToolItem["category"][] = [
  "together",
  "lottery",
  "manage",
];

export function ToolsGrid() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    ...toolCategories[cat],
    items: toolItems.filter((t) => t.category === cat),
  }));

  return (
    <section
      id="tools"
      className="relative overflow-hidden bg-atmosphere px-6 py-28 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-display text-[0.7rem] tracking-[0.35em] text-(--champagne-deep) uppercase">
            Party Tools
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-wide text-(--ink) sm:text-[2.5rem] sm:leading-tight">
            余興・進行ツール一覧
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-(--muted) sm:text-[0.95rem] sm:leading-7">
            インストール不要。スマホからそのまま開いて使えます。
          </p>
        </header>

        <div className="mt-16 space-y-12">
          {grouped
            .filter(({ items }) => items.length > 0)
            .map(({ cat, label, labelEn, items }) => (
              <div key={cat}>
                <div className="mb-5 flex items-baseline gap-3 border-b border-(--line) pb-3">
                  <span className="font-display text-sm font-semibold tracking-widest text-(--champagne-deep) uppercase">
                    {labelEn}
                  </span>
                  <span className="text-sm text-(--muted)">{label}</span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((tool) => (
                    <li key={tool.id}>
                      <a
                        href={tool.href}
                        className="group flex h-full flex-col gap-1 border border-(--line) bg-(--surface) px-5 py-5 transition-colors duration-200 hover:border-(--ink) hover:bg-(--ink)"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[0.65rem] tracking-[0.2em] text-(--champagne-deep) uppercase transition-colors group-hover:text-(--champagne-soft)">
                            {tool.titleEn}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-(--ink-soft) transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--champagne-soft)" />
                        </div>
                        <p className="font-display text-base font-semibold tracking-wide text-(--ink) transition-colors group-hover:text-white">
                          {tool.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-6 text-(--muted) transition-colors group-hover:text-white/70">
                          {tool.description}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
