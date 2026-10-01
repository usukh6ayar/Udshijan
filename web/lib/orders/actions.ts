"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { computeTotals } from "@/lib/pricing";
import { newAccessKey, orderCookieName, orderCookieOptions } from "./access";
import {
  mergeQuantities,
  OrderProblem,
  parseCartLines,
  toOrderItems,
  type ReservedProduct,
} from "./build";
import { makeOrderNumber } from "./number";
import { insertOrder, reserveStock, stockOf } from "./repo";
import {
  parseCheckoutForm,
  phoneDigits,
  validateCheckout,
  type CheckoutErrors,
} from "./validate";

export type PlaceOrderResult =
  | { ok: true; number: string }
  | { ok: false; errors?: CheckoutErrors; problems?: string[] };

const UNAVAILABLE =
  "Захиалга түр хүлээж авах боломжгүй байна. Хэсэг хугацааны дараа дахин оролдоно уу.";

/**
 * Захиалга үүсгэнэ. Үнэ, дүнг клиентээс АВАХГҮЙ — DB-ийн үнээр дахин тооцно.
 * Үлдэгдэл хасах ба захиалга бичих нь нэг transaction: аль нэг бараа
 * хүрэлцэхгүй бол юу ч өөрчлөгдөхгүй.
 */
export async function placeOrder(input: {
  form: unknown;
  lines: unknown;
  coupon: unknown;
}): Promise<PlaceOrderResult> {
  const form = parseCheckoutForm(input.form);
  const errors = validateCheckout(form);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const lines = parseCartLines(input.lines);
  if (!lines) {
    return {
      ok: false,
      problems: ["Сагсны мэдээлэл буруу байна. Сагсаа шалгаад дахин оролдоно уу."],
    };
  }
  const couponCode = typeof input.coupon === "string" ? input.coupon : null;
  const accessKey = newAccessKey();

  let number: string;
  try {
    number = await db.transaction(async (tx) => {
      const reserved = new Map<string, ReservedProduct>();
      const problems: string[] = [];
      const merged = mergeQuantities(lines);

      // Тогтмол дарааллаар түгжинэ — зэрэг захиалгууд бие биенээ deadlock хийхгүй
      for (const slug of [...merged.keys()].sort()) {
        const qty = merged.get(slug)!;
        const product = await reserveStock(tx, slug, qty);
        if (product) {
          reserved.set(slug, product);
          continue;
        }
        const current = await stockOf(tx, slug);
        problems.push(
          !current
            ? "Сагсанд байгаа зарим бараа зарагдахаа больсон байна. Сагсаа шинэчилнэ үү."
            : current.stock <= 0
              ? `“${current.title}” дууссан байна.`
              : `“${current.title}” — ердөө ${current.stock} ширхэг үлдсэн байна.`,
        );
      }
      if (problems.length > 0) throw new OrderProblem([...new Set(problems)]);

      const items = toOrderItems(lines, reserved);
      const totals = computeTotals({
        lines: items.map((i) => ({ unitPrice: i.unitPrice, qty: i.qty })),
        couponCode,
        shipping: form.shipping,
      });
      const pickup = form.shipping === "pickup";

      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = makeOrderNumber();
        const inserted = await insertOrder(tx, {
          number: candidate,
          status: "new",
          accessKey,
          name: form.name.trim(),
          phone: phoneDigits(form.phone),
          email: form.email.trim(),
          city: form.city,
          district: form.district,
          khoroo: pickup ? "" : form.khoroo.trim(),
          address: pickup ? "" : form.address.trim(),
          note: form.note.trim(),
          shipping: form.shipping,
          payment: form.payment,
          items,
          subtotal: totals.subtotal,
          couponCode: totals.couponCode,
          couponDiscount: totals.couponDiscount,
          shippingFee: totals.shippingFee,
          total: totals.total,
        });
        if (inserted) return candidate;
      }
      throw new Error("Захиалгын дугаар 5 удаа давхардлаа");
    });
  } catch (error) {
    if (error instanceof OrderProblem) return { ok: false, problems: error.problems };
    console.error("placeOrder амжилтгүй", error);
    return { ok: false, problems: [UNAVAILABLE] };
  }

  // Үлдэгдэл өөрчлөгдсөн — дэлгүүрийн хуудсууд шууд шинэ тоог харуулна
  updateTag("products");
  for (const slug of new Set(lines.map((l) => l.slug))) updateTag("product-" + slug);

  (await cookies()).set(orderCookieName(number), accessKey, orderCookieOptions());
  return { ok: true, number };
}
