import { and, desc, eq, gte, inArray, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders,
  products,
  type OrderInsert,
  type OrderRow,
} from "@/drizzle/schema";
import type { ReservedProduct } from "./build";
import { DEMO_PAYABLE, type OrderStatus } from "./types";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = Tx | typeof db;

/**
 * Үлдэгдэл хүрэлцвэл хасаад барааны мэдээллийг буцаана, үгүй бол null.
 * `stock >= qty` нөхцөл нэг UPDATE дотор тул зэрэг захиалгад давхар зарагдахгүй.
 */
export async function reserveStock(
  tx: Tx,
  slug: string,
  qty: number,
): Promise<ReservedProduct | null> {
  const rows = await tx
    .update(products)
    .set({ stock: sql`${products.stock} - ${qty}` })
    .where(and(eq(products.slug, slug), gte(products.stock, qty)))
    .returning({
      slug: products.slug,
      title: products.title,
      sku: products.sku,
      price: products.price,
      compareAt: products.compareAt,
    });
  return rows[0] ?? null;
}

/** Алдааны мессежид — бараа байгаа эсэх, хэдэн ширхэг үлдсэн */
export async function stockOf(
  tx: Tx,
  slug: string,
): Promise<{ title: string; stock: number } | null> {
  const rows = await tx
    .select({ title: products.title, stock: products.stock })
    .from(products)
    .where(eq(products.slug, slug));
  return rows[0] ?? null;
}

export async function restock(tx: Tx, slug: string, qty: number): Promise<void> {
  await tx
    .update(products)
    .set({ stock: sql`${products.stock} + ${qty}` })
    .where(eq(products.slug, slug));
}

/** Дугаар давхардвал false — дуудагч шинэ дугаараар дахин оролдоно */
export async function insertOrder(tx: Tx, row: OrderInsert): Promise<boolean> {
  const rows = await tx
    .insert(orders)
    .values(row)
    .onConflictDoNothing()
    .returning({ number: orders.number });
  return rows.length > 0;
}

export async function findOrder(number: string): Promise<OrderRow | null> {
  const rows = await db.select().from(orders).where(eq(orders.number, number));
  return rows[0] ?? null;
}

export async function listOrders(status: OrderStatus | "all"): Promise<OrderRow[]> {
  return db
    .select()
    .from(orders)
    .where(status === "all" ? undefined : eq(orders.status, status))
    .orderBy(desc(orders.createdAt))
    .limit(200);
}

/**
 * Төлбөрийг тэмдэглэнэ. `demo` — зөвхөн QPay/карт, шинэ төлөвтэй; `admin` —
 * цуцлагдаагүй бол ямар ч арга. Аль хэдийн төлөгдсөн бол false.
 */
export async function markPaid(
  number: string,
  via: "demo" | "admin",
): Promise<boolean> {
  const conditions = [eq(orders.number, number), isNull(orders.paidAt)];
  if (via === "demo") {
    conditions.push(eq(orders.status, "new"), inArray(orders.payment, DEMO_PAYABLE));
  } else {
    conditions.push(ne(orders.status, "cancelled"));
  }
  const rows = await db
    .update(orders)
    .set({ paidAt: new Date(), paidVia: via })
    .where(and(...conditions))
    .returning({ number: orders.number });
  return rows.length > 0;
}

/** Зөвхөн `new` төлөвөөс шилжүүлнэ — хоёр таб зэрэг дарахад нэг нь л ажиллана */
export async function leaveNewStatus(
  exec: Executor,
  number: string,
  status: "done" | "cancelled",
): Promise<OrderRow | null> {
  const rows = await exec
    .update(orders)
    .set({ status })
    .where(and(eq(orders.number, number), eq(orders.status, "new")))
    .returning();
  return rows[0] ?? null;
}
