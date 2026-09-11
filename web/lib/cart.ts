"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { productBySlug } from "./data/products";
import type { Product } from "./data/types";

export type CartLine = {
  slug: string;
  /** Сонгосон вариантууд — мөрийг ялгах түлхүүрийн нэг хэсэг */
  color?: string;
  size?: string;
  qty: number;
};

export type ResolvedLine = CartLine & {
  product: Product;
  /** price × qty */
  lineTotal: number;
  /** (compareAt − price) × qty; хямдралгүй бол 0 */
  lineSavings: number;
};

export type CartTotals = {
  /** Σ (price × qty) */
  subtotal: number;
  /** Σ ((compareAt − price) × qty) — дүнгээс ХАСАГДАХГҮЙ, зөвхөн харуулна */
  savings: number;
  /** Купоны хөнгөлөлт — тусад нь харуулна */
  couponSavings: number;
  /** subtotal ≥ FREE_SHIPPING_FROM бол 0 */
  shipping: number;
  freeShipping: boolean;
  /** НӨАТ үнэд шингэсэн */
  vat: number;
  /** subtotal + shipping */
  total: number;
};

export const FREE_SHIPPING_FROM = 100_000;
export const SHIPPING_FEE = 5_000;
export const VAT_RATE = 0.1;

/** Дизайн дээрх демо купон */
const COUPONS: Record<string, number> = { NAIM8: 0.15 };

const STORAGE_KEY = "udshijan.cart.v1";

type CartData = { lines: CartLine[]; coupon: string | null };

/** Дизайны 1e дэлгэц дээрх эхний сагс — SSR-ийн эхлэл төлөв */
const SEED: CartData = {
  lines: [
    { slug: "eregtei-hovon-futbolk", color: "Хар", size: "L", qty: 2 },
    { slug: "utasgui-chihevch", color: "Хар", qty: 1 },
    { slug: "ars-archilgaanii-bagts", qty: 1 },
  ],
  coupon: "NAIM8",
};

export function lineKey(line: Pick<CartLine, "slug" | "color" | "size">): string {
  return [line.slug, line.color ?? "", line.size ?? ""].join("|");
}

/* ── localStorage-д суурилсан гадаад store ───────────────────────────────
   useSyncExternalStore ашигласнаар hydration-ы дараа сервер/клиентийн
   төлөв React өөрөө сольдог тул effect дотор setState дуудах шаардлагагүй. */

const listeners = new Set<() => void>();
let cache: CartData | null = null;

function load(): CartData {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CartData>;
      cache = {
        lines: Array.isArray(parsed.lines) ? parsed.lines : [],
        coupon: parsed.coupon ?? null,
      };
      return cache;
    }
  } catch {
    // Гэмтсэн өгөгдөл — эхлэл төлөв рүү буцна
  }
  cache = SEED;
  return cache;
}

function save(next: CartData) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Хадгалах боломжгүй (private горим) — санах ойд үлдэнэ
  }
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getServerSnapshot = () => SEED;

export function useCart() {
  const data = useSyncExternalStore(subscribe, load, getServerSnapshot);

  const add = useCallback((line: CartLine) => {
    const current = load();
    const key = lineKey(line);
    const exists = current.lines.some((l) => lineKey(l) === key);
    save({
      ...current,
      lines: exists
        ? current.lines.map((l) =>
            lineKey(l) === key ? { ...l, qty: l.qty + line.qty } : l,
          )
        : [...current.lines, line],
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const current = load();
    save({
      ...current,
      lines:
        qty <= 0
          ? current.lines.filter((l) => lineKey(l) !== key)
          : current.lines.map((l) => (lineKey(l) === key ? { ...l, qty } : l)),
    });
  }, []);

  const remove = useCallback((key: string) => {
    const current = load();
    save({ ...current, lines: current.lines.filter((l) => lineKey(l) !== key) });
  }, []);

  const clear = useCallback(() => save({ ...load(), lines: [] }), []);

  const applyCoupon = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!(normalized in COUPONS)) return false;
    save({ ...load(), coupon: normalized });
    return true;
  }, []);

  const removeCoupon = useCallback(() => save({ ...load(), coupon: null }), []);

  const resolved = useMemo<ResolvedLine[]>(
    () =>
      data.lines.flatMap((line) => {
        const product = productBySlug(line.slug);
        if (!product) return [];
        return [
          {
            ...line,
            product,
            lineTotal: product.price * line.qty,
            lineSavings: product.compareAt
              ? (product.compareAt - product.price) * line.qty
              : 0,
          },
        ];
      }),
    [data.lines],
  );

  const couponRate = data.coupon ? (COUPONS[data.coupon] ?? 0) : 0;
  const totals = useMemo(
    () => computeTotals(resolved, couponRate),
    [resolved, couponRate],
  );
  const count = useMemo(
    () => resolved.reduce((sum, l) => sum + l.qty, 0),
    [resolved],
  );

  return {
    lines: data.lines,
    coupon: data.coupon,
    couponRate,
    resolved,
    count,
    totals,
    add,
    setQty,
    remove,
    clear,
    applyCoupon,
    removeCoupon,
  };
}

/**
 * Дизайны 1e дэлгэцийн арифметик:
 *   Барааны дүн = Σ (үнэ × тоо)              → 299,600₮
 *   Хөнгөлөлт   = хэмнэсэн дүн, ХАСАГДАХГҮЙ  → зөвхөн харуулна
 *   Хүргэлт     = 100,000₮-с дээш бол үнэгүй
 *   НӨАТ (10%)  = үнэд шингэсэн → subtotal − subtotal/1.1 → 27,236₮
 *   Нийт        = Барааны дүн + хүргэлт        → 299,600₮
 */
export function computeTotals(lines: ResolvedLine[], couponRate = 0): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const savings = lines.reduce((sum, l) => sum + l.lineSavings, 0);
  const couponSavings = Math.round(subtotal * couponRate);
  const freeShipping = subtotal >= FREE_SHIPPING_FROM;
  const shipping = subtotal === 0 || freeShipping ? 0 : SHIPPING_FEE;
  const vat = Math.round(subtotal - subtotal / (1 + VAT_RATE));
  return {
    subtotal,
    savings,
    couponSavings,
    shipping,
    freeShipping,
    vat,
    total: subtotal + shipping,
  };
}
