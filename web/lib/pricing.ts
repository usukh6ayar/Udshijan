/**
 * Сагс, checkout, серверийн `placeOrder` гурвын ГАНЦ үнийн тооцоо.
 * Клиент, сервер хоёул импортолдог тул цэвэр байх ёстой — DB, React алга.
 */

export type ShippingMethod = "standard" | "express" | "pickup";

export const FREE_SHIPPING_FROM = 100_000;
export const SHIPPING_FEE = 5_000;
export const EXPRESS_FEE = 10_000;
export const VAT_RATE = 0.1;

/** Купон → хөнгөлөлтийн хувь */
const COUPONS: Record<string, number> = { NAIM8: 0.15 };

/** Хүчинтэй бол томоор бичсэн кодыг, үгүй бол null */
export function normalizeCoupon(code: string | null | undefined): string | null {
  const normalized = (code ?? "").trim().toUpperCase();
  return normalized in COUPONS ? normalized : null;
}

export function couponRate(code: string | null | undefined): number {
  const normalized = normalizeCoupon(code);
  return normalized ? COUPONS[normalized] : 0;
}

/** Үнэгүй хүргэлтийн босгыг купоноос өмнөх `subtotal`-аар шалгана */
export function shippingFeeFor(method: ShippingMethod, subtotal: number): number {
  if (method === "pickup") return 0;
  if (method === "express") return EXPRESS_FEE;
  return subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

export type PricedLine = {
  unitPrice: number;
  /** Хямдралаас өмнөх үнэ — зөвхөн «хэмнэсэн» дүнг харуулахад */
  compareAt?: number | null;
  qty: number;
};

export type Totals = {
  /** Σ (үнэ × тоо) */
  subtotal: number;
  /** Σ ((compareAt − үнэ) × тоо) — subtotal-д аль хэдийн шингэсэн, зөвхөн харуулна */
  savings: number;
  /** Хүчинтэй купоны код, эсвэл null */
  couponCode: string | null;
  couponRate: number;
  couponDiscount: number;
  shippingFee: number;
  freeShipping: boolean;
  /** `total` дотор шингэсэн НӨАТ — зөвхөн харуулна */
  vat: number;
  /** subtotal − couponDiscount + shippingFee */
  total: number;
};

export function computeTotals({
  lines,
  couponCode = null,
  shipping = "standard",
}: {
  lines: PricedLine[];
  couponCode?: string | null;
  shipping?: ShippingMethod;
}): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const savings = lines.reduce(
    (sum, l) =>
      sum +
      (l.compareAt && l.compareAt > l.unitPrice
        ? (l.compareAt - l.unitPrice) * l.qty
        : 0),
    0,
  );
  const code = normalizeCoupon(couponCode);
  const rate = code ? COUPONS[code] : 0;
  const couponDiscount = Math.round(subtotal * rate);
  const shippingFee = shippingFeeFor(shipping, subtotal);
  const total = subtotal - couponDiscount + shippingFee;

  return {
    subtotal,
    savings,
    couponCode: code,
    couponRate: rate,
    couponDiscount,
    shippingFee,
    freeShipping: shippingFee === 0 && subtotal > 0,
    vat: Math.round(total - total / (1 + VAT_RATE)),
    total,
  };
}
