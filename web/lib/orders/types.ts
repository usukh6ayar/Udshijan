import type { ShippingMethod } from "@/lib/pricing";

export type { ShippingMethod };

export type OrderStatus = "new" | "done" | "cancelled";

export type PaymentMethod = "qpay" | "card" | "transfer" | "cash";

export const PAYMENT_KEYS: PaymentMethod[] = ["qpay", "card", "transfer", "cash"];

/** Демо урсгалаар хэрэглэгч өөрөө «төлсөн» гэж тэмдэглэж болох аргууд */
export const DEMO_PAYABLE: PaymentMethod[] = ["qpay", "card"];

/** Захиалгын үеийн барааны хуулбар — дараа үнэ, нэр өөрчлөгдсөн ч хэвээр */
export type OrderItem = {
  slug: string;
  title: string;
  sku: string;
  color?: string;
  size?: string;
  qty: number;
  unitPrice: number;
};
