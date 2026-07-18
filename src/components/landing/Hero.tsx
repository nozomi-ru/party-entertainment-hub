import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { appLinks, siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2400&q=80"
        alt="祝福に満ちたパーティー会場の様子"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--charcoal)]/55 via-[var(--charcoal)]/40 to-[var(--charcoal)]/70"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(197, 165, 114, 0.35), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col justify-center px-6 py-24 text-center sm:px-8">
        <p className="animate-fade-up font-[family-name:var(--font-display)] text-sm tracking-[0.35em] text-[var(--gold-light)] uppercase sm:text-base">
          {siteConfig.nameEn}
        </p>
        <h1 className="animate-fade-up animation-delay-100 mt-5 font-[family-name:var(--font-display)] text-5xl leading-[1.15] font-semibold tracking-wide text-white sm:text-6xl md:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="animate-fade-up animation-delay-200 mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
          {siteConfig.tagline}
          <br className="hidden sm:block" />
          二次会の余興を、もっと穏やかに、もっと一体感のある時間へ。
        </p>

        <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href={appLinks.primaryCta.href}
            className={cn(
              buttonVariants({ variant: "gold", size: "lg" }),
              "min-w-[200px]",
            )}
          >
            {appLinks.primaryCta.label}
            <ArrowRight />
          </Link>
          <Link
            href={appLinks.secondaryCta.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-w-[200px] border-white/40 bg-white/10 text-white hover:border-white/70 hover:bg-white/20",
            )}
          >
            {appLinks.secondaryCta.label}
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--cream)] to-transparent"
        aria-hidden
      />
    </section>
  );
}
