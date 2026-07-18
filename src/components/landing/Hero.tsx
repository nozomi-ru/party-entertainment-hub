import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { appLinks, siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=70"
        alt="祝福に満ちたパーティー会場の様子"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--ink)]/70 via-[var(--ink)]/45 to-[var(--ink)]/80"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_35%,rgba(168,155,124,0.18),transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 pb-28 pt-24 text-center sm:px-8">
        <p className="animate-fade-up font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.45em] text-[var(--champagne-soft)] uppercase sm:text-xs">
          {siteConfig.nameEn}
        </p>

        <h1 className="animate-fade-up animation-delay-100 mt-6 font-[family-name:var(--font-display)] text-[clamp(3.25rem,12vw,5.75rem)] leading-[1.05] font-semibold tracking-[0.04em] text-white">
          {siteConfig.name}
        </h1>

        <div
          className="animate-line-draw mx-auto mt-7 h-px w-16 bg-[var(--champagne-soft)]/80"
          aria-hidden
        />

        <p className="animate-fade-up animation-delay-200 mx-auto mt-7 max-w-md text-[0.95rem] leading-[1.85] text-white/85 sm:text-base">
          {siteConfig.tagline}
        </p>

        <div className="animate-fade-up animation-delay-300 mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href={appLinks.primaryCta.href}
            className={cn(
              buttonVariants({ variant: "gold", size: "lg" }),
              "min-w-[11.5rem] tracking-wide",
            )}
          >
            {appLinks.primaryCta.label}
            <ArrowRight />
          </Link>
          <Link
            href={appLinks.secondaryCta.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-w-[11.5rem] border-white/35 bg-white/10 text-white hover:border-white/60 hover:bg-white/15",
            )}
          >
            {appLinks.secondaryCta.label}
          </Link>
        </div>
      </div>

      <a
        href="#solutions"
        className="animate-scroll-cue absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--champagne-soft)]/80 transition-opacity hover:opacity-100"
        aria-label="次のセクションへ"
      >
        <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
      </a>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--paper)] to-transparent"
        aria-hidden
      />
    </section>
  );
}
