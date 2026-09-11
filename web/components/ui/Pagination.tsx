import Link from "next/link";
import { cx } from "@/lib/format";

/** 1c хуудасны "Өмнөх 1 2 3 … 27 Дараах" */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  const items = pageItems(page, totalPages);
  const cell =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-btn border px-3 text-small transition-colors";

  return (
    <nav aria-label="Хуудаслалт" className="flex flex-wrap items-center gap-2">
      <Edge
        href={hrefFor(page - 1)}
        disabled={page <= 1}
        className={cell}
        label="Өмнөх"
      />
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-small text-ink-2">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={cx(
              cell,
              item === page
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:bg-surface",
            )}
          >
            {item}
          </Link>
        ),
      )}
      <Edge
        href={hrefFor(page + 1)}
        disabled={page >= totalPages}
        className={cell}
        label="Дараах"
      />
    </nav>
  );
}

function Edge({
  href,
  disabled,
  className,
  label,
}: {
  href: string;
  disabled: boolean;
  className: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className={cx(className, "border-line bg-white text-ink-2 opacity-50")}
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cx(className, "border-line bg-white text-ink hover:bg-surface")}
    >
      {label}
    </Link>
  );
}

function pageItems(page: number, total: number): (number | "…")[] {
  if (total <= 5) return range(1, total);
  if (page <= 3) return [...range(1, 3), "…", total];
  if (page >= total - 2) return [1, "…", ...range(total - 2, total)];
  return [1, "…", page, "…", total];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
