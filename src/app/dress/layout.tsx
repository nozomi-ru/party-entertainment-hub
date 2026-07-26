import type { ReactNode } from "react";

/**
 * ドレス色当て専用レイアウト（人間ビンゴと同系の紙×金トーン）。
 * Playfair Display / Noto Serif JP は layout の link で読み込む。
 */
export default function DressLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
