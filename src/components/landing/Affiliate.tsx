import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Package,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { affiliateItems, type AffiliateItem } from "@/config/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const iconMap: Record<AffiliateItem["icon"], LucideIcon> = {
  "shopping-bag": ShoppingBag,
  package: Package,
  award: Award,
};

export function Affiliate() {
  return (
    <section
      id="affiliate"
      className="relative bg-[var(--cream)] px-6 py-24 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-[var(--gold-deep)] uppercase">
            Recommendations
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--charcoal)] sm:text-4xl">
            景品・ギフトのおすすめ
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            余興の盛り上がりを支える、景品選びの参考リンクです。必要に応じて差し替えてご利用ください。
          </p>
        </header>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {affiliateItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Card
                key={item.id}
                className="group flex flex-col border-[var(--border)] bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/50 hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-md bg-[var(--gold-muted)] px-2.5 py-1 text-xs font-medium tracking-wide text-[var(--gold-deep)]">
                      {item.badge}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cream)] text-[var(--charcoal)] transition-colors group-hover:bg-[var(--gold)] group-hover:text-white">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold-deep)] transition-colors hover:text-[var(--charcoal)]"
                  >
                    ショップを見る
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
