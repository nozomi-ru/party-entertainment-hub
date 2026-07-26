"use client";

import {
  formatExpiresAtJa,
  ROOM_TTL_EXTEND_LABEL,
  ROOM_TTL_NOTICE,
} from "@/lib/room-ttl";

type Props = {
  expiresAt?: number | null;
  onExtend: () => void | Promise<void>;
  busy?: boolean;
  /** 作成前など、期限がまだ無いときに注意文だけ出す */
  showNotice?: boolean;
  className?: string;
};

export function RoomTtlBar({
  expiresAt,
  onExtend,
  busy = false,
  showNotice = false,
  className,
}: Props) {
  const hasDeadline =
    typeof expiresAt === "number" && Number.isFinite(expiresAt) && expiresAt > 0;

  if (!hasDeadline && !showNotice) return null;

  return (
    <div className={className} data-testid="room-ttl-bar">
      {showNotice || !hasDeadline ? (
        <p className="dress-hint dress-ttl-note" data-testid="room-ttl-notice">
          {ROOM_TTL_NOTICE}
        </p>
      ) : null}
      {hasDeadline ? (
        <>
          <p className="dress-hint" data-testid="room-ttl-deadline">
            削除期限: <strong>{formatExpiresAtJa(expiresAt)}</strong>
            （日本時間）
          </p>
          <button
            type="button"
            className="dress-btn dress-btn--ghost"
            style={{ width: "100%", marginTop: "0.45rem" }}
            disabled={busy}
            data-testid="room-ttl-extend"
            onClick={() => void onExtend()}
          >
            {ROOM_TTL_EXTEND_LABEL}
          </button>
        </>
      ) : null}
    </div>
  );
}
