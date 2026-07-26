import type { CSSProperties, HTMLAttributes } from "react";

type Props = {
  color: string;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLSpanElement>, "color">;

/**
 * ドレスフォーム＋ストラップレス・ボールガウン（正面）。
 * 添付ポスターの線画トーンに合わせ、塗りと線を同一 SVG で重ねる。
 */
export function DressIcon({ color, className, style, ...rest }: Props) {
  return (
    <span
      className={`dress-icon${className ? ` ${className}` : ""}`}
      style={style}
      aria-hidden
      {...rest}
    >
      <svg
        className="dress-icon-svg"
        viewBox="0 0 200 320"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {/* マネキン */}
        <circle
          cx="100"
          cy="34"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M100 40.5 V56"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M66 76 C78 64 90 58 100 58 C110 58 122 64 134 76"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
        <path
          d="M66 76 V90 M134 76 V90"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* ドレス塗り＋外形 */}
        <path
          fill={color}
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
          d="
            M78 76
            C86 88 94 94 100 90
            C106 94 114 88 122 76
            C128 84 130 96 128 108
            C126 122 116 132 100 136
            C84 132 74 122 72 108
            C70 96 72 84 78 76Z
            M72 112
            C56 136 40 178 32 220
            C26 252 24 278 30 296
            C38 310 64 316 100 316
            C136 316 162 310 170 296
            C176 278 174 252 168 220
            C160 178 144 136 128 112
            C116 124 100 128 100 128
            C100 128 84 124 72 112Z
          "
        />

        {/* スイートハート（塗り上の線を強調） */}
        <path
          d="M78 76 C86 88 94 94 100 90 C106 94 114 88 122 76"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ウエスト V */}
        <path
          d="M74 114 C88 128 112 128 126 114"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* ひだ */}
        <g
          stroke="currentColor"
          strokeLinecap="round"
          fill="none"
          opacity="0.38"
        >
          <path d="M86 130 C76 190 68 245 62 304" strokeWidth="1.1" />
          <path d="M100 128 C100 195 100 255 100 310" strokeWidth="1.1" />
          <path d="M114 130 C124 190 132 245 138 304" strokeWidth="1.1" />
          <path
            d="M78 145 C66 205 54 255 48 298"
            strokeWidth="1"
            opacity="0.75"
          />
          <path
            d="M122 145 C134 205 146 255 152 298"
            strokeWidth="1"
            opacity="0.75"
          />
        </g>

        {/* 裾 */}
        <path
          d="M32 290 C48 280 64 294 80 284 C96 274 104 274 120 284 C136 294 152 280 168 290"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </span>
  );
}
