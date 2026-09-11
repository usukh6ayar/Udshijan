import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export type BadgeTone =
  | "sale"
  | "wholesale"
  | "inStock"
  | "lowStock"
  | "outOfStock"
  | "new";

const TONES: Record<BadgeTone, string> = {
  sale: "bg-danger text-white",
  wholesale: "bg-brand-tint text-brand",
  inStock: "bg-success/10 text-success",
  lowStock: "bg-warning/12 text-warning",
  outOfStock: "bg-line text-ink-2",
  new: "bg-ink text-white",
};

export function Badge({
  tone = "sale",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-[6px] px-2 py-1 text-caption font-bold tracking-normal",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Идэвхтэй шүүлтүүрийн чип — × товчтой */
export function Chip({
  children,
  onRemove,
  as = "span",
}: {
  children: ReactNode;
  onRemove?: () => void;
  as?: "span" | "button";
}) {
  const Tag = as;
  return (
    <Tag className="inline-flex items-center gap-1.5 rounded-btn bg-brand-tint px-3 py-1.5 text-small text-brand">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Шүүлтүүр хасах"
          className="-mr-1 rounded p-0.5 hover:bg-brand/10"
        >
          <X className="size-3.5" />
        </button>
      )}
    </Tag>
  );
}

/** ★★★★★ 4.8 (126) */
export function Rating({
  value,
  count,
  suffix,
  size = "sm",
}: {
  value: number;
  count?: number;
  /** ж: "үнэлгээ" → "(24 үнэлгээ)" */
  suffix?: string;
  size?: "sm" | "md";
}) {
  const star = size === "md" ? "text-[17px]" : "text-[13px]";
  const full = Math.round(value);

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        aria-hidden
        className={cx("tracking-[1px] text-rating", star)}
        style={{ lineHeight: 1 }}
      >
        {"★".repeat(full)}
        <span className="text-line">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-small font-bold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-small text-ink-2">
          ({count}
          {suffix ? ` ${suffix}` : ""})
        </span>
      )}
      <span className="sr-only">5-аас {value} оноо</span>
    </span>
  );
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success";
  children: ReactNode;
}) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role="status"
      className={cx(
        "flex items-start gap-2 rounded-card px-3 py-2.5 text-small",
        tone === "error"
          ? "bg-danger/8 text-danger"
          : "bg-success/10 text-success",
      )}
    >
      <Icon className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cx("animate-pulse rounded-card bg-surface", className)} />
  );
}
