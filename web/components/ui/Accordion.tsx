import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export type AccordionItem = { q: string; a: ReactNode };

/**
 * Түгээмэл асуултуудад ашиглана. `details/summary` дээр суурилсан тул
 * JavaScript ачаалагдаагүй үед ч нээгддэг (server component хэвээр үлдэнэ).
 */
export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  return (
    <div
      className={cx(
        "divide-y divide-line overflow-hidden rounded-card border border-line bg-white",
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-body font-bold hover:bg-surface">
            {item.q}
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-ink-2 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-5 pb-4 text-body text-ink-2">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
