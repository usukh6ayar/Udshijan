"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useProductCache } from "./product-cache";
import {
  computeTotals,
  couponRate as rateOf,
  normalizeCoupon,
  type PricedLine,
} from "./pricing";
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

/** `lib/pricing`-ийн оролт — үнийг Product-аас авна */
export function toPricedLine(line: ResolvedLine): PricedLine {
  return {
    unitPrice: line.product.price,
    compareAt: line.product.compareAt,
    qty: line.qty,
  };
}

const STORAGE_KEY = "udshijan.cart.v1";

type CartData = { lines: CartLine[]; coupon: string | null };

/** Шинэ зочин хоосон сагсаар эхэлнэ — SSR-ийн эхлэл төлөв */
const EMPTY: CartData = { lines: [], coupon: null };

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
  cache = EMPTY;
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

const getServerSnapshot = () => EMPTY;

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
    const normalized = normalizeCoupon(code);
    if (!normalized) return false;
    save({ ...load(), coupon: normalized });
    return true;
  }, []);

  const removeCoupon = useCallback(() => save({ ...load(), coupon: null }), []);

  /* Бүтээгдэхүүний мэдээлэл DB-д байгаа тул энэ дериваци синхрон байж чадахгүй.
     localStorage зөвхөн slug хадгална, Product-ыг Route Handler-ээс татна. */
  const { cache: productCache, ready } = useProductCache(
    data.lines.map((l) => l.slug),
  );

  const resolved = useMemo<ResolvedLine[]>(
    () =>
      data.lines.flatMap((line) => {
        const product = productCache.get(line.slug);
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
    [data.lines, productCache],
  );

  const couponRate = rateOf(data.coupon);
  const totals = useMemo(
    () =>
      computeTotals({
        lines: resolved.map(toPricedLine),
        couponCode: data.coupon,
      }),
    [resolved, data.coupon],
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
    /**
     * Мөр байгаа ч харуулах юм алга, бас хүсэлт дуусаагүй — «хоосон сагс»-наас
     * ялгана. Хүсэлт дууссаны дараа (алдаатай ч бай) skeleton-оос гарна.
     * `resolved.length` нөхцөл нь шинэ бараа нэмэхэд ажиллаж байгаа сагс
     * skeleton болж анивчихаас сэргийлнэ — мэдэгдэж буй мөрүүд хэвээр харагдана.
     */
    loading: data.lines.length > 0 && resolved.length === 0 && !ready,
    add,
    setQty,
    remove,
    clear,
    applyCoupon,
    removeCoupon,
  };
}
