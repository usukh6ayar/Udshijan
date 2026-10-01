"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { markDemoPaid } from "@/lib/orders/actions";
import { money } from "@/lib/format";

/**
 * ДЕМО төлбөр: жинхэнэ QPay/карттай холбогдоогүй. «Төлсөн гэж тэмдэглэх»
 * нь зөвхөн захиалгын төлөвийг өөрчилнө, мөнгө шилжихгүй.
 */
export function DemoPayment({
  number,
  method,
  total,
}: {
  number: string;
  method: "qpay" | "card";
  total: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function pay() {
    setFailed(false);
    startTransition(async () => {
      const res = await markDemoPaid(number);
      if (res.ok) router.refresh();
      else setFailed(true);
    });
  }

  return (
    <section className="rounded-card border border-line bg-white p-5">
      <h2 className="text-h3">{method === "qpay" ? "QPay-ээр төлөх" : "Картаар төлөх"}</h2>
      <p className="mt-3 rounded-card bg-surface px-3 py-2.5 text-small text-ink-2">
        <b className="text-ink">Симуляц.</b> Энэ бол демо төлбөр — жинхэнэ
        QPay/карттай холбогдоогүй, бодит мөнгө шилжихгүй.
      </p>

      {method === "qpay" ? (
        <DemoQr seed={number} />
      ) : (
        <p className="mt-4 text-small text-ink-2">
          Демо горимд картын мэдээлэл оруулахгүй.
        </p>
      )}

      <p className="mt-4 text-center text-small text-ink-2">Төлөх дүн</p>
      <p className="text-center text-h2 tabular-nums">{money(total)}</p>

      <Button className="mt-4" onClick={pay} loading={pending} fullWidth size="lg">
        Төлбөр төлөгдсөн гэж тэмдэглэх
      </Button>
      {failed && (
        <p className="mt-2 text-small text-danger">
          Төлбөрийг тэмдэглэж чадсангүй. Хуудсаа сэргээгээд дахин оролдоно уу.
        </p>
      )}
    </section>
  );
}

/** Захиалгын дугаараас тогтмол үүсэх QR-маягийн зураг — уншигдахгүй, зөвхөн дүрслэл */
function DemoQr({ seed }: { seed: string }) {
  return (
    <svg
      viewBox="0 0 21 21"
      className="mx-auto mt-4 size-44"
      role="img"
      aria-label="Демо QR код"
      shapeRendering="crispEdges"
    >
      {qrCells(seed).map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
      ))}
    </svg>
  );
}

function qrCells(seed: string): [number, number][] {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const cells: [number, number][] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (inFinder) {
        const fx = x > 13 ? x - 14 : x;
        const fy = y > 13 ? y - 14 : y;
        const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const eye = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        if (ring || eye) cells.push([x, y]);
        continue;
      }
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      if ((h >>> 0) % 2 === 0) cells.push([x, y]);
    }
  }
  return cells;
}
