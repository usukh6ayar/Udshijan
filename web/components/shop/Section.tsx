import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Нүүр хуудасны хэсгийн толгой — гарчиг + "Бүгдийг харах" + сумнууд */
export function SectionHeader({
  title,
  subtitle,
  linkLabel,
  linkHref,
  arrows = false,
}: {
  title: string;
  subtitle?: string;
  linkLabel?: string;
  linkHref?: string;
  arrows?: boolean;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 lg:mb-6">
      <div>
        <h2 className="text-h2">{title}</h2>
        {subtitle && <p className="mt-1 text-small text-ink-2">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {linkLabel && linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1.5 text-small font-bold text-brand hover:underline"
          >
            {linkLabel}
            {!arrows && <ArrowRight className="size-4" />}
          </Link>
        )}
        {arrows && (
          <div className="hidden gap-2 lg:flex">
            <ArrowBtn dir="prev" />
            <ArrowBtn dir="next" />
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowBtn({ dir }: { dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Өмнөх" : "Дараах"}
      className="flex size-10 items-center justify-center rounded-btn border border-line bg-white text-ink hover:bg-surface"
    >
      <Icon className="size-4" />
    </button>
  );
}

export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className ?? "container-uds mt-12 lg:mt-16"}>
      {children}
    </section>
  );
}
