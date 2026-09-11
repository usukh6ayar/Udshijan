"use client";

import type { ReactNode } from "react";
import type { CartTotals } from "@/lib/cart";
import { cx, money } from "@/lib/format";

/**
 * Сагс болон checkout хоёрын хуваалцдаг «Захиалгын дүн» самбар.
 * Тооцоолол нь `computeTotals` дээр хийгддэг — энд зөвхөн харуулна.
 */
export function OrderSummary({
  totals,
  title = "Захиалгын дүн",
  footer,
}: {
  totals: CartTotals;
  title?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white">
      <h2 className="border-b border-line px-5 py-4 text-h3">{title}</h2>

      <dl className="space-y-3 px-5 py-4 text-body">
        <SummaryRow label="Барааны дүн" value={money(totals.subtotal)} />
        {totals.savings > 0 && (
          <SummaryRow
            label="Хөнгөлөлт"
            value={`−${money(totals.savings)}`}
            tone="success"
          />
        )}
        <SummaryRow
          label="Хүргэлт"
          value={totals.freeShipping ? "Үнэгүй" : money(totals.shipping)}
          tone={totals.freeShipping ? "success" : undefined}
        />
        <SummaryRow label="НӨАТ (10%)" value={money(totals.vat)} />
      </dl>

      <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
        <span className="text-h3">Нийт</span>
        <span className="text-[26px] leading-none font-extrabold tabular-nums">
          {money(totals.total)}
        </span>
      </div>

      {footer && <div className="space-y-3 px-5 pb-5">{footer}</div>}
    </div>
  );
}

export function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd
        className={cx(
          "font-bold tabular-nums",
          tone === "success" ? "text-success" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
