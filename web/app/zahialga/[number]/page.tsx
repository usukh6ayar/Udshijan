import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { OrderDetails } from "@/components/shop/OrderDetails";
import { DemoPayment } from "@/components/shop/OrderPayment";
import { OrderPhoneGate } from "@/components/shop/OrderPhoneGate";
import { Alert, Skeleton } from "@/components/ui/Badge";
import type { OrderRow } from "@/drizzle/schema";
import { BANK_TRANSFER } from "@/lib/data/store";
import {
  formatOrderDate,
  PAYMENT_LABEL,
  paymentState,
  STATUS_LABEL,
} from "@/lib/orders/labels";
import { orderForViewer } from "@/lib/orders/viewer";

export const metadata: Metadata = {
  title: "Захиалга",
  robots: { index: false },
};

/**
 * Хувийн мэдээлэлтэй хуудас — cookie уншдаг тул кэшлэгдэхгүй. `params`,
 * cookie хоёулаа Suspense-ийн дотор уншигдана.
 */
export default function OrderPage(props: PageProps<"/zahialga/[number]">) {
  return (
    <Shell mobileTitle="Захиалга" mobileActions="cart">
      <div className="container-uds py-6 lg:py-10">
        <Suspense fallback={<Skeleton className="h-[420px] border border-line" />}>
          <OrderContent params={props.params} />
        </Suspense>
      </div>
    </Shell>
  );
}

async function OrderContent({
  params,
}: Pick<PageProps<"/zahialga/[number]">, "params">) {
  const { number } = await params;
  const order = await orderForViewer(number);
  if (!order) return <OrderPhoneGate number={decodeURIComponent(number).toUpperCase()} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1">Захиалга {order.number}</h1>
        <p className="mt-1.5 text-body text-ink-2">
          {formatOrderDate(order.createdAt)} · {STATUS_LABEL[order.status]} ·{" "}
          {PAYMENT_LABEL[order.payment]} · {paymentState(order)}
        </p>
      </header>

      {order.status === "cancelled" && <Alert>Энэ захиалга цуцлагдсан.</Alert>}
      {order.status === "new" && !order.paidAt && <PaymentPanel order={order} />}

      <OrderDetails order={order} />
    </div>
  );
}

function PaymentPanel({ order }: { order: OrderRow }) {
  if (order.payment === "qpay" || order.payment === "card") {
    return <DemoPayment number={order.number} method={order.payment} total={order.total} />;
  }

  if (order.payment === "transfer") {
    return (
      <section className="rounded-card border border-line bg-white p-5 text-body">
        <h2 className="text-h3">Банкны шилжүүлэг</h2>
        {BANK_TRANSFER.demo && (
          <p className="mt-3 rounded-card bg-surface px-3 py-2.5 text-small text-ink-2">
            <b className="text-ink">Демо данс.</b> Энэ дансанд мөнгө шилжүүлэхгүй
            байна уу.
          </p>
        )}
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Банк</dt>
            <dd className="font-bold">{BANK_TRANSFER.bank}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Данс</dt>
            <dd className="font-mono font-bold">{BANK_TRANSFER.account}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Хүлээн авагч</dt>
            <dd className="font-bold">{BANK_TRANSFER.holder}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">Гүйлгээний утга</dt>
            <dd className="font-mono font-bold">{order.number}</dd>
          </div>
        </dl>
        <p className="mt-4 text-small text-ink-2">
          Шилжүүлэг орж ирмэгц оператор төлбөрийг баталгаажуулна.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-line bg-white p-5">
      <h2 className="text-h3">Хүргэлтийн үед бэлнээр төлнө</h2>
      <p className="mt-2 text-small text-ink-2">
        Барааг хүлээн авахдаа хүргэлтийн ажилтанд төлнө үү.
      </p>
    </section>
  );
}
