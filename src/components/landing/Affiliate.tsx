import { affiliateBanners } from "@/config/site";

export function Affiliate() {
  return (
    <section
      id="affiliate"
      className="relative overflow-hidden bg-atmosphere px-6 py-28 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.35em] text-[var(--champagne-deep)] uppercase">
            PR
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-[var(--ink)] sm:text-[2.5rem] sm:leading-tight">
            ご参列の後は、あなたの縁活を
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem] sm:leading-7">
            婚活パーティーへの参加や、パートナーシップ診断で、
            <br className="hidden sm:inline" />
            出会いの次のステップを探してみませんか。
          </p>
        </header>

        <div className="mt-16 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-3 sm:gap-6">
          {affiliateBanners.map((banner) => (
            <div key={banner.id} className="w-full max-w-[300px]">
              <a
                href={banner.href}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="flex aspect-[6/5] w-full items-center justify-center overflow-hidden border border-[var(--line)] bg-[var(--surface)] transition-opacity duration-300 hover:opacity-90"
              >
                {/* A8 計測タグ互換のため next/image ではなく素の img を使う */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageSrc}
                  width={banner.imageWidth}
                  height={banner.imageHeight}
                  alt={banner.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </a>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.trackingPixelSrc}
                width={1}
                height={1}
                alt=""
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
