"use server";

import { refresh, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { mergeQuantities } from "@/lib/orders/build";
import { normalizeOrderNumber } from "@/lib/orders/number";
import { leaveNewStatus, markPaid, restock } from "@/lib/orders/repo";
import { requireAdmin } from "./session";

function numberOf(formData: FormData): string | null {
  return normalizeOrderNumber(String(formData.get("number") ?? ""));
}

/** Шилжүүлэг, бэлэн төлбөрийг гараар баталгаажуулна */
export async function adminMarkPaid(formData: FormData): Promise<void> {
  await requireAdmin();
  const number = numberOf(formData);
  if (!number) return;
  await markPaid(number, "admin");
  refresh();
}

export async function adminCompleteOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const number = numberOf(formData);
  if (!number) return;
  await leaveNewStatus(db, number, "done");
  refresh();
}

/**
 * Зөвхөн `new` захиалгыг цуцалж, хасагдсан үлдэгдлийг нэг transaction-д буцаана.
 * Төлөв нь нөхцөлтэй update тул хоёр таб зэрэг дарахад нэг л удаа буцаана.
 */
export async function adminCancelOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const number = numberOf(formData);
  if (!number) return;

  const slugs = await db.transaction(async (tx) => {
    const order = await leaveNewStatus(tx, number, "cancelled");
    if (!order) return [];
    const merged = mergeQuantities(order.items);
    // Бараа DB-ээс устсан бол restock 0 мөр шинэчилнэ — алдаа биш
    for (const [slug, qty] of merged) await restock(tx, slug, qty);
    return [...merged.keys()];
  });

  if (slugs.length > 0) {
    updateTag("products");
    for (const slug of slugs) updateTag("product-" + slug);
  }
  refresh();
}
