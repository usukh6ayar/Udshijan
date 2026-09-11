"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { productBySlug } from "./data/products";
import type { Product } from "./data/types";

const STORAGE_KEY = "udshijan.wishlist.v1";

/**
 * Сагснаас ялгаатай нь эхлэл төлөв нь ХООСОН. Сагсанд демо бараа суулгасан нь
 * дизайны 1e дэлгэц дүүрэн сагс харуулдагтай холбоотой; хүслийн жагсаалтын
 * дүүрэн дэлгэц дизайнд байхгүй тул хэрэглэгчийн дараагүй зүрх дүүрэн
 * харагдах нь алдаа мэт сэтгэгдэл төрүүлнэ.
 */
const EMPTY: string[] = [];

/* ── lib/cart.ts-тэй ижил бүтэц: localStorage-д суурилсан гадаад store ─── */

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function load(): string[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      cache = Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === "string")
        : EMPTY;
      return cache;
    }
  } catch {
    // Гэмтсэн өгөгдөл — хоосон жагсаалт руу буцна
  }
  cache = EMPTY;
  return cache;
}

function save(next: string[]) {
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

export function useWishlist() {
  const slugs = useSyncExternalStore(subscribe, load, getServerSnapshot);

  const has = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  const toggle = useCallback((slug: string) => {
    const current = load();
    save(
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug],
    );
  }, []);

  const remove = useCallback((slug: string) => {
    save(load().filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => save([]), []);

  const resolved = useMemo<Product[]>(
    () =>
      slugs.flatMap((slug) => {
        const product = productBySlug(slug);
        return product ? [product] : [];
      }),
    [slugs],
  );

  return { slugs, resolved, count: resolved.length, has, toggle, remove, clear };
}
