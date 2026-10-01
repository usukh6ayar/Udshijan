import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderDetails } from "@/components/shop/OrderDetails";
import { Button } from "@/components/ui/Button";
import {
  adminCancelOrder,
  adminCompleteOrder,
  adminMarkPaid,
} from "@/lib/admin/order-actions";
import { requireAdminPage } from "@/lib/admin/session";
import {
  formatOrderDate,
  PAYMENT_LABEL,
  paymentState,
  STATUS_LABEL,
} from "@/lib/orders/labels";
import { normalizeOrderNumber } from "@/lib/orders/number";
import { findOrder } from "@/lib/orders/repo";
import { AdminNav } from "../../AdminNav";

export default function AdminOrderPage(props: PageProps<"/admin/zahialga/[number]">) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <AdminNav active="orders" />
      <Link href="/admin/zahialga" className="text-small text-ink-2 hover:underline">
        ← Жагсаалт руу
      </Link>
      <Suspense fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}>
        <OrderAdminContent params={props.params} />
      </Suspense>
    </main>
  );
}

async function OrderAdminContent({
  params,
}: Pick<PageProps<"/admin/zahialga/[number]">, "params">) {
  await requireAdminPage();
  const number = normalizeOrderNumber((await params).number);
  const order = number ? await findOrder(number) : null;
  if (!order) notFound();

  const canPay = !order.paidAt && order.status !== "cancelled";
  const isNew = order.status === "new";

  return (
    <div className="mt-3 space-y-6">
      <header>
        <h1 className="font-mono text-h2">{order.number}</h1>
        <p className="mt-1.5 text-body text-ink-2">
          {formatOrderDate(order.createdAt)} · {STATUS_LABEL[order.status]} ·{" "}
          {PAYMENT_LABEL[order.payment]} · {paymentState(order)}
        </p>
      </header>

      {(canPay || isNew) && (
        <div className="flex flex-wrap gap-3">
          {canPay && (
            <form action={adminMarkPaid}>
              <input type="hidden" name="number" value={order.number} />
              <Button type="submit" variant="secondary">
                Төлбөр төлөгдсөн гэж тэмдэглэх
              </Button>
            </form>
          )}
          {isNew && (
            <form action={adminCompleteOrder}>
              <input type="hidden" name="number" value={order.number} />
              <Button type="submit">Дууссан болгох</Button>
            </form>
          )}
          {isNew && (
            <form action={adminCancelOrder}>
              <input type="hidden" name="number" value={order.number} />
              <Button type="submit" variant="destructive">
                Цуцлах (үлдэгдэл буцна)
              </Button>
            </form>
          )}
        </div>
      )}

      <OrderDetails order={order} />
    </div>
  );
}
