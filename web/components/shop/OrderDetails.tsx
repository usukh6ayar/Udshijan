import type { OrderRow } from "@/drizzle/schema";
import { SHIPPING_LABEL } from "@/lib/orders/labels";
import { money } from "@/lib/format";
import { SummaryRow } from "./OrderSummary";

/** Захиалгын бараа, дүн, хүргэлт — хэрэглэгчийн хуудас ба admin хоёул */
export function OrderDetails({ order }: { order: OrderRow }) {
  const place =
    order.shipping === "pickup"
      ? "Сүхбаатар дүүрэг, 1-р хороо · Даваа–Ням 09:00–20:00"
      : [order.city, order.district, order.khoroo, order.address]
          .filter(Boolean)
          .join(", ");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-card border border-line bg-white">
        <h2 className="border-b border-line px-5 py-4 text-h3">Бараа</h2>
        <ul className="divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-small font-medium">{item.title}</p>
                <p className="mt-0.5 text-small text-ink-2">
                  {[item.color, item.size].filter(Boolean).join(" · ")}
                  {item.color || item.size ? " · " : ""}
                  {item.qty} × {money(item.unitPrice)}
                </p>
              </div>
              <span className="shrink-0 text-small font-bold tabular-nums">
                {money(item.unitPrice * item.qty)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-4">
        <section className="overflow-hidden rounded-card border border-line bg-white">
          <dl className="space-y-3 px-5 py-4 text-body">
            <SummaryRow label="Барааны дүн" value={money(order.subtotal)} />
            {order.couponDiscount > 0 && (
              <SummaryRow
                label={`Купон (${order.couponCode})`}
                value={`−${money(order.couponDiscount)}`}
                tone="success"
              />
            )}
            <SummaryRow
              label="Хүргэлт"
              value={order.shippingFee === 0 ? "Үнэгүй" : money(order.shippingFee)}
            />
          </dl>
          <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
            <span className="text-h3">Нийт</span>
            <span className="text-[22px] leading-none font-extrabold tabular-nums">
              {money(order.total)}
            </span>
          </div>
        </section>

        <section className="rounded-card border border-line bg-white px-5 py-4 text-small">
          <h2 className="text-h3">{SHIPPING_LABEL[order.shipping]}</h2>
          <p className="mt-2 text-ink-2">{place}</p>
          <p className="mt-2">
            {order.name} · {order.phone}
            {order.email ? ` · ${order.email}` : ""}
          </p>
          {order.note && <p className="mt-2 text-ink-2">Тэмдэглэл: {order.note}</p>}
        </section>
      </div>
    </div>
  );
}
