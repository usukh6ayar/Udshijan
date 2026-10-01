import Link from "next/link";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin/session";
import { cx, money } from "@/lib/format";
import { formatOrderDate, paymentState, STATUS_LABEL } from "@/lib/orders/labels";
import { listOrders } from "@/lib/orders/repo";
import type { OrderStatus } from "@/lib/orders/types";
import { AdminNav } from "../AdminNav";

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "new", label: "Шинэ" },
  { key: "done", label: "Дууссан" },
  { key: "cancelled", label: "Цуцлагдсан" },
  { key: "all", label: "Бүгд" },
];

export default function AdminOrdersPage(props: PageProps<"/admin/zahialga">) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <AdminNav active="orders" />
      <h1 className="text-h2">Захиалга</h1>
      <Suspense fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}>
        <OrderRows searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function OrderRows({
  searchParams,
}: Pick<PageProps<"/admin/zahialga">, "searchParams">) {
  await requireAdminPage();
  const raw = (await searchParams).status;
  const status = FILTERS.find((f) => f.key === raw)?.key ?? "new";
  const rows = await listOrders(status);

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/zahialga?status=${f.key}`}
            className={cx(
              "rounded-full border px-3 py-1 text-small",
              f.key === status
                ? "border-ink bg-ink text-white"
                : "border-line text-ink-2 hover:text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-small text-ink-2">Захиалга алга.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {rows.map((o) => (
            <li key={o.number} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/zahialga/${o.number}`}
                  className="font-mono text-body font-medium underline-offset-2 hover:underline"
                >
                  {o.number}
                </Link>
                <p className="mt-0.5 truncate text-small text-ink-2">
                  {o.name} · {o.phone} · {formatOrderDate(o.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right text-small">
                <p className="font-bold tabular-nums">{money(o.total)}</p>
                <p className="text-ink-2">
                  {STATUS_LABEL[o.status]} · {paymentState(o)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
