import type { OrderRow } from "@/drizzle/schema";
import type { OrderStatus, PaymentMethod, ShippingMethod } from "./types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Шинэ",
  done: "Дууссан",
  cancelled: "Цуцлагдсан",
};

export const SHIPPING_LABEL: Record<ShippingMethod, string> = {
  standard: "Стандарт хүргэлт",
  express: "Шуурхай хүргэлт",
  pickup: "Салбараас очиж авах",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  qpay: "QPay",
  card: "Карт",
  transfer: "Банкны шилжүүлэг",
  cash: "Хүргэлтийн үед бэлнээр",
};

export function paymentState(order: Pick<OrderRow, "paidAt" | "paidVia">): string {
  if (!order.paidAt) return "Төлөгдөөгүй";
  return order.paidVia === "demo" ? "Төлөгдсөн (демо)" : "Төлөгдсөн";
}

/** «2026-10-01 14:05» — Улаанбаатарын цагаар */
export function formatOrderDate(date: Date): string {
  return date
    .toLocaleString("sv-SE", { timeZone: "Asia/Ulaanbaatar" })
    .slice(0, 16);
}
