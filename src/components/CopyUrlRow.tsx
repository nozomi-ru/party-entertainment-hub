"use client";

import { useId, useRef, useState } from "react";

type Props = {
  label: string;
  url: string;
  testId?: string;
  textTestId?: string;
};

/**
 * フルURLを表示し、ワンタップ／ワンクリックでコピー。
 * clipboard 不可時は入力欄を選択して手動コピーしやすくする。
 */
export function CopyUrlRow({ label, url, testId, textTestId }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return;
    } catch {
      /* fall through */
    }
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        /* 選択済みなので Ctrl+C / 長押しコピー可 */
      }
    }
  };

  return (
    <div className="copy-url-row" data-testid={testId}>
      <label className="copy-url-label" htmlFor={id}>
        {label}
      </label>
      <div className="copy-url-controls">
        <input
          ref={inputRef}
          id={id}
          type="text"
          readOnly
          value={url}
          className="copy-url-input"
          data-testid={textTestId}
          onFocus={(e) => e.currentTarget.select()}
          onClick={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          className={`copy-url-btn${copied ? " is-copied" : ""}`}
          data-testid={testId ? `${testId}-copy` : undefined}
          onClick={() => void copy()}
        >
          {copied ? "コピー済" : "コピー"}
        </button>
      </div>
    </div>
  );
}
