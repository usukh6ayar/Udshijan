import { cookies } from "next/headers";
import type { OrderRow } from "@/drizzle/schema";
import { keyMatches, orderCookieName } from "./access";
import { normalizeOrderNumber } from "./number";
import { findOrder } from "./repo";

/**
 * Энэ браузерт тухайн захиалгын түлхүүр cookie байвал захиалгыг буцаана,
 * үгүй бол null. Байхгүй дугаар, буруу cookie хоёр ижилхэн null.
 */
export async function orderForViewer(rawNumber: string): Promise<OrderRow | null> {
  const number = normalizeOrderNumber(rawNumber);
  if (!number) return null;
  const key = (await cookies()).get(orderCookieName(number))?.value;
  if (!key) return null;
  const order = await findOrder(number);
  return order && keyMatches(key, order.accessKey) ? order : null;
}
